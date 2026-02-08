// src/components/ContestCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { format, differenceInSeconds } from 'date-fns';
import { CalendarPlus, Clock, ExternalLink } from 'lucide-react';
import { Contest, getBrandColors, getPlatformIcon, getCalendarLink } from '../lib/utils';

// --- Smart Countdown Sub-Component ---
const SmartCountdown = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const target = new Date(targetDate);
      const diff = differenceInSeconds(target, now);

      if (diff <= 0) {
        setTimeLeft('Starting...');
        return;
      }

      // If > 24 hours, show "X Days"
      if (diff > 86400) {
        const days = Math.ceil(diff / 86400);
        setTimeLeft(`${days} days`);
        setIsUrgent(false);
      } else {
        // If < 24 hours, show "HH:MM:SS"
        const h = Math.floor(diff / 3600).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
        const s = (diff % 60).toString().padStart(2, '0');
        setTimeLeft(`${h}:${m}:${s}`);
        setIsUrgent(true);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
      isUrgent 
        ? 'bg-blue-50 text-blue-700 border-blue-100' 
        : 'bg-gray-50 text-gray-500 border-gray-100'
    }`}>
      <Clock className="w-3.5 h-3.5" />
      <span className="tabular-nums tracking-wide">{timeLeft}</span>
    </div>
  );
};

export default function ContestCard({ contest }: { contest: Contest }) {
  const startDate = new Date(contest.startTime);
  const brand = getBrandColors(contest.platform);

  return (
    <div className={`group relative bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 ring-1 ring-transparent ${brand.ring}`}>
      
      {/* Top Row: Badge & Countdown */}
      <div className="flex items-center justify-between mb-4">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${brand.bg} ${brand.text} ${brand.border}`}>
          {getPlatformIcon(contest.platform, "w-4 h-4")}
          <span className="text-[11px] font-bold tracking-wider uppercase">{contest.platform}</span>
        </div>
        <SmartCountdown targetDate={contest.startTime} />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start gap-5">
        
        {/* Date Box (Premium Calendar Leaf Look) */}
        <div className="hidden sm:flex flex-col items-center justify-center w-16 h-16 bg-gray-50/80 rounded-2xl border border-gray-100/80 backdrop-blur-sm">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{format(startDate, "MMM")}</span>
          <span className="text-2xl font-bold text-gray-900 leading-none mt-0.5">{format(startDate, "d")}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors truncate pr-4">
            <a href={contest.url} target="_blank" rel="noreferrer" className="flex items-center gap-2">
              {contest.name}
              <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400" />
            </a>
          </h3>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 mt-3">
            
            {/* Mobile Date Fallback */}
            <div className="sm:hidden flex items-center gap-1.5 text-sm text-gray-500 font-medium">
               <span className="text-gray-900">{format(startDate, "MMM d")}</span>
               <span className="w-1 h-1 rounded-full bg-gray-300"></span>
               <span>{format(startDate, "h:mm a")}</span>
            </div>

            {/* Desktop Time Info */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-gray-500">
              <span>{format(startDate, "EEEE")}</span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span>{format(startDate, "h:mm a")}</span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
               <span>Duration: {contest.duration}</span>
            </div>

            {/* Add to Cal Button */}
            <a 
              href={getCalendarLink(contest)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add to Calendar</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}