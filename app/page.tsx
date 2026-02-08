// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Loader2, Trophy, Filter } from 'lucide-react';
import { Contest } from './_lib/utils';
import ContestCard from './_components/ContestCard';
import LiveWidget from './_components/LiveWidget';

export default function Home() {
  const [upcomingContests, setUpcomingContests] = useState<Contest[]>([]);
  const [liveContests, setLiveContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function fetchContests() {
      try {
        const res = await fetch('/api/contests');
        const data = await res.json();

        if (data.status === 'success') {
          setLiveContests(data.data.filter((c: Contest) => c.status === 'CODING'));
          setUpcomingContests(data.data.filter((c: Contest) => c.status === 'BEFORE'));
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

  const filteredUpcoming = filter === 'all'
    ? upcomingContests
    : upcomingContests.filter(c => c.platform.toLowerCase() === filter);

  return (
    <main className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans pb-20">

      {/* Background Gradients (Subtle Premium Feel) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-96 bg-linear-to-b from-gray-100 to-transparent opacity-50"></div>
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
        <div className="absolute top-[10%] left-[-5%] w-72 h-72 bg-purple-100/30 rounded-full blur-3xl"></div>
      </div>

      <LiveWidget liveContests={liveContests} />

      <div className="relative z-10 max-w-2xl mx-auto px-5 pt-16 md:pt-24">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900">
              Contest<span className="text-blue-600">Tracker</span>
            </h1>
            <p className="text-gray-500 mt-2 font-medium text-sm">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Glassy Filters */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-white/70 backdrop-blur-md p-1.5 rounded-2xl shadow-sm border border-white/50 ring-1 ring-gray-900/5">
            {['all', 'codeforces', 'leetcode', 'codechef'].map((p) => (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className={`w-full flex items-center justify-center py-2.5 rounded-xl text-xs font-bold capitalize transition-all duration-200 ${filter === p
                    ? 'bg-gray-900 text-white shadow-md transform scale-[1.02]'
                    : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                  }`}
              >
                {p === 'codeforces' ? 'Codeforces' : p === 'leetcode' ? 'LeetCode' : p === 'codechef' ? 'CodeChef' : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* States: Loading / Error / Empty */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
            <p className="text-gray-400 font-medium text-xs tracking-widest uppercase">Syncing Calendars...</p>
          </div>
        )}

        {error && (
          <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-center text-red-600 text-sm font-medium">
            {error}
          </div>
        )}

        {!loading && !error && filteredUpcoming.length === 0 && (
          <div className="text-center py-24 bg-white/50 rounded-3xl border border-gray-100 border-dashed backdrop-blur-sm">
            <Trophy className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">No upcoming contests found.</p>
          </div>
        )}

        {/* Contest List */}
        <div className="space-y-4">
          {filteredUpcoming.map((contest, index) => (
            <ContestCard key={index} contest={contest} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 mb-8 text-center flex justify-center items-center flex-col gap-2">
          <div className='w-32 rounded-full h-1 bg-gray-200'></div>
          <p className="text-[10px] text-gray-300 font-medium uppercase tracking-widest">Designed for Consistency</p>
        </div>
      </div>
    </main>
  );
}