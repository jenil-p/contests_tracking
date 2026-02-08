import { NextResponse } from 'next/server';
import axios from 'axios';

// 1. Get URLs
const CODEFORCES_API = process.env.CODEFORCES_API_URL || 'https://codeforces.com/api/contest.list';
const LEETCODE_API = process.env.LEETCODE_API_URL || 'https://leetcode.com/graphql';
const CODECHEF_API = process.env.CODECHEF_API_URL || 'https://www.codechef.com/api/list/contests/all';

// --- Helper Functions ---

// Check if a contest is currently active
function getStatus(startTimeUnix: number, durationSeconds: number): 'CODING' | 'BEFORE' {
    const now = Date.now() / 1000;
    const endTime = startTimeUnix + durationSeconds;

    if (now >= startTimeUnix && now < endTime) return 'CODING';
    return 'BEFORE';
}

async function fetchCodeforcesContests() {
    try {
        const response = await axios.get(CODEFORCES_API);
        if (response.data.status !== 'OK') throw new Error('Failed to fetch Codeforces');

        // Filter: Upcoming (BEFORE) OR Ongoing (CODING)
        const relevantContests = response.data.result
            .filter((c: any) => c.phase === 'BEFORE' || c.phase === 'CODING')
            .map((c: any) => ({
                platform: 'Codeforces',
                name: c.name,
                startTimeUnix: c.startTimeSeconds,
                durationSeconds: c.durationSeconds,
                startTime: new Date(c.startTimeSeconds * 1000).toISOString(),
                endTime: new Date((c.startTimeSeconds + c.durationSeconds) * 1000).toISOString(),
                duration: `${Math.floor(c.durationSeconds / 3600)}h ${(c.durationSeconds % 3600) / 60}m`,
                url: `https://codeforces.com/contests/${c.id}`,
                status: c.phase // 'CODING' or 'BEFORE'
            }));

        return relevantContests;
    } catch (error: any) {
        console.error('Error fetching Codeforces:', error.message);
        return [];
    }
}

async function fetchLeetcodeContests() {
    try {
        const graphqlQuery = {
            query: `query getContestList { allContests { title startTime duration titleSlug } }`
        };

        const response = await axios.post(LEETCODE_API, graphqlQuery, { headers: { 'Content-Type': 'application/json' } });
        const allContests = response.data.data.allContests;
        const now = Date.now() / 1000;

        // Filter: End time must be in the future
        const activeContests = allContests
            .filter((c: any) => (c.startTime + c.duration) > now)
            .map((c: any) => ({
                platform: 'LeetCode',
                name: c.title,
                startTimeUnix: c.startTime,
                durationSeconds: c.duration,
                startTime: new Date(c.startTime * 1000).toISOString(),
                endTime: new Date((c.startTime + c.duration) * 1000).toISOString(),
                duration: `${Math.floor(c.duration / 3600)}h ${(c.duration % 3600) / 60}m`,
                url: `https://leetcode.com/contest/${c.titleSlug}`,
                status: getStatus(c.startTime, c.duration)
            }));

        return activeContests;
    } catch (error: any) {
        console.error('Error fetching LeetCode:', error.message);
        return [];
    }
}

async function fetchCodechefContests() {
    try {
        const response = await axios.get(CODECHEF_API);
        if (!response.data.future_contests) throw new Error('Failed to fetch CodeChef');

        // CodeChef separates "present" and "future" lists sometimes, but usually "future" contains upcoming.
        // We might need to check "present_contests" if available, but for now let's map what we have.
        // If you need strictly active ones from CodeChef, we might need to fetch a different endpoint or check both arrays.
        // For this snippet, we stick to the provided endpoint but calculate status manually.

        const all = [...(response.data.present_contests || []), ...(response.data.future_contests || [])];

        const activeContests = all.map((c: any) => {
            const startUnix = Math.floor(new Date(c.contest_start_date).getTime() / 1000);
            const duration = Number(c.contest_duration) * 60; // CodeChef sends minutes
            return {
                platform: 'CodeChef',
                name: c.contest_name,
                startTimeUnix: startUnix,
                durationSeconds: duration,
                startTime: new Date(c.contest_start_date).toISOString(),
                endTime: new Date(c.contest_end_date).toISOString(),
                duration: `${Math.floor(duration / 3600)}h ${(duration % 3600) / 60}m`,
                url: `https://www.codechef.com/${c.contest_code}`,
                status: getStatus(startUnix, duration)
            };
        });

        return activeContests;
    } catch (error: any) {
        console.error('Error fetching CodeChef:', error.message);
        return [];
    }
}

export async function GET() {
    try {
        const [codeforces, leetcode, codechef] = await Promise.all([
            fetchCodeforcesContests(),
            fetchLeetcodeContests(),
            fetchCodechefContests()
        ]);

        // Sort: Active contests first, then by start time
        const allContests = [...codeforces, ...leetcode, ...codechef]
            .sort((a, b) => {
                if (a.status === 'CODING' && b.status !== 'CODING') return -1;
                if (a.status !== 'CODING' && b.status === 'CODING') return 1;
                return a.startTimeUnix - b.startTimeUnix;
            });

        return NextResponse.json({
            status: 'success',
            count: allContests.length,
            data: allContests
        });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}