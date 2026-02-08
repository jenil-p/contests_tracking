import { NextResponse } from 'next/server';
import axios from 'axios';
import { config } from 'dotenv';

const CODEFORCES_API = process.env.CODEFORCES_API_URL
const LEETCODE_API = process.env.LEETCODE_API_URL
const CODECHEF_API = process.env.CODECHEF_API_URL


async function fetchCodeforcesContests() {
    try {
        const response = await axios.get(CODEFORCES_API);
        if (response.data.status !== 'OK') {
            throw new Error('Failed to fetch Codeforces contests');
        }
        
        const activeContests = response.data.result
            .filter((contest: any) => contest.phase === 'BEFORE')
            .map((contest: any) => ({
                platform: 'Codeforces',
                name: contest.name,
                startTimeUnix: contest.startTimeSeconds,
                startTime: new Date(contest.startTimeSeconds * 1000).toISOString(),
                duration: `${Math.floor(contest.durationSeconds / 3600)}h ${(contest.durationSeconds % 3600) / 60}m`,
                url: `https://codeforces.com/contests/${contest.id}`
            }));
        return activeContests;
    } catch (error: any) {
        console.error('Error fetching Codeforces:', error.message);
        return [];
    }
}

async function fetchLeetcodeContests() {
    try {
        const graphqlQuery = {
            query: `
        query getContestList {
          allContests {
            title
            startTime
            duration
            titleSlug
          }
        }
      `
        };
        const response = await axios.post(LEETCODE_API, graphqlQuery, {
            headers: { 'Content-Type': 'application/json' }
        });

        const allContests = response.data.data.allContests;
        const now = Date.now();

        
        const activeContests = allContests
            .filter((contest: any) => contest.startTime * 1000 > now)
            .map((contest: any) => ({
                platform: 'LeetCode',
                name: contest.title,
                startTimeUnix: contest.startTime,
                startTime: new Date(contest.startTime * 1000).toISOString(),
                duration: `${Math.floor(contest.duration / 3600)}h ${(contest.duration % 3600) / 60}m`,
                url: `https://leetcode.com/contest/${contest.titleSlug}`
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
        if (!response.data.future_contests) {
            throw new Error('Failed to fetch CodeChef contests');
        }
        const activeContests = response.data.future_contests.map((contest: any) => ({
            platform: 'CodeChef',
            name: contest.contest_name,
            startTimeUnix: Math.floor(new Date(contest.contest_start_date).getTime() / 1000),
            startTime: new Date(contest.contest_start_date).toISOString(),
            duration: `${Math.floor(Number(contest.contest_duration) / 60)}h ${Number(contest.contest_duration) % 60}m`,
            url: `https://www.codechef.com/${contest.contest_code}`
        }));
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

        
        const allContests = [...codeforces, ...leetcode, ...codechef]
            .sort((a, b) => a.startTimeUnix - b.startTimeUnix);

        return NextResponse.json({
            status: 'success',
            count: allContests.length,
            data: allContests
        });
    } catch (error: any) {
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}