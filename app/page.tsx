'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ExternalLink, Loader2, Calendar, Clock } from 'lucide-react';

interface Contest {
  platform: string;
  name: string;
  startTime: string;
  duration: string;
  url: string;
}

export default function Home() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchContests() {
      try {
        // Fetch from our internal Next.js API route
        const res = await fetch('/api/contests');
        const data = await res.json();

        if (data.status === 'success') {
          setContests(data.data);
        } else {
          setError('Failed to load contests');
        }
      } catch (err) {
        setError('Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    fetchContests();
  }, []);

  // Platform badge colors
  const getPlatformStyle = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'codeforces': return 'bg-blue-900 text-blue-200 border-blue-700';
      case 'leetcode': return 'bg-yellow-900 text-yellow-200 border-yellow-700';
      case 'codechef': return 'bg-orange-900 text-orange-200 border-orange-700';
      default: return 'bg-gray-800 text-gray-200';
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text mb-2">
            Contest Tracker
          </h1>
          <p className="text-gray-400">Never miss a Codeforces, LeetCode, or CodeChef round again.</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
            <p className="text-gray-500">Fetching upcoming contests...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg text-red-200 text-center">
            {error}
          </div>
        )}

        {/* Contest List */}
        {!loading && !error && (
          <div className="grid gap-4">
            {contests.length === 0 ? (
              <p className="text-center text-gray-500">No upcoming contests found.</p>
            ) : (
              contests.map((contest, index) => (
                <a
                  key={index}
                  href={contest.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-[#161616] hover:bg-[#1f1f1f] border border-gray-800 hover:border-gray-700 rounded-xl p-5 transition-all duration-200 relative overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                    {/* Left Side: Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-bold px-2 py-1 rounded border ${getPlatformStyle(contest.platform)}`}>
                          {contest.platform}
                        </span>
                        <h2 className="text-lg font-semibold group-hover:text-blue-400 transition-colors">
                          {contest.name}
                        </h2>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-400 mt-2">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{format(new Date(contest.startTime), "EEE, MMM d • h:mm a")}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{contest.duration}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Icon */}
                    <ExternalLink className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                  </div>
                </a>
              ))
            )}
          </div>
        )}
      </div>
    </main>
  );
}