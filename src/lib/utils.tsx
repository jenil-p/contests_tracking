import { SiCodeforces, SiCodechef } from "react-icons/si";
import { TbBrandLeetcode } from "react-icons/tb";
import { Trophy } from "lucide-react";

export interface Contest {
    platform: string;
    name: string;
    startTime: string;
    endTime: string;
    duration: string;
    url: string;
    status: 'CODING' | 'BEFORE';
    durationSeconds: number;
}

export const getPlatformIcon = (platform: string, className = "w-5 h-5") => {
    switch (platform.toLowerCase()) {
        case 'codeforces': return <SiCodeforces className={className} />;
        case 'leetcode': return <TbBrandLeetcode className={className} />;
        case 'codechef': return <SiCodechef className={className} />;
        default: return <Trophy className={className} />;
    }
};

export const getBrandColors = (platform: string) => {
    switch (platform.toLowerCase()) {
        case 'codeforces': return { bg: 'bg-blue-50/50', text: 'text-blue-600', border: 'border-blue-100', ring: 'group-hover:ring-blue-100' };
        case 'leetcode': return { bg: 'bg-yellow-50/50', text: 'text-yellow-600', border: 'border-yellow-100', ring: 'group-hover:ring-yellow-100' };
        case 'codechef': return { bg: 'bg-orange-50/50', text: 'text-orange-700', border: 'border-orange-100', ring: 'group-hover:ring-orange-100' };
        default: return { bg: 'bg-gray-50/50', text: 'text-gray-600', border: 'border-gray-100', ring: 'group-hover:ring-gray-100' };
    }
};

export const getCalendarLink = (contest: Contest) => {
    try {
        const start = new Date(contest.startTime);
        let end = new Date(contest.endTime);
        if (isNaN(end.getTime())) {
            const durationSecs = contest.durationSeconds || 7200;
            end = new Date(start.getTime() + durationSecs * 1000);
        }
        if (isNaN(start.getTime())) return '#';
        const fmt = (date: Date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(contest.name)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(contest.url)}&location=${encodeURIComponent(contest.platform)}`;
    } catch { return '#'; }
};