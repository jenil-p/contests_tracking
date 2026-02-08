// src/components/LiveWidget.tsx
'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, X, ChevronRight, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { Contest, getPlatformIcon } from '../_lib/utils';

const LiveProgressBar = ({ startTime, endTime }: { startTime: string; endTime: string }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();
      const total = end - start;
      const elapsed = now - start;
      setProgress(Math.min(100, Math.max(0, (elapsed / total) * 100)));
    };
    update();
    const interval = setInterval(update, 60000); 
    return () => clearInterval(interval);
  }, [startTime, endTime]);

  return (
    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-3">
      <div className="h-full bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-1000" style={{ width: `${progress}%` }} />
    </div>
  );
};

export default function LiveWidget({ liveContests }: { liveContests: Contest[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (liveContests.length === 0) return null;

  const current = liveContests[currentIndex];
  const total = liveContests.length;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % total);
  };

  return (
    <>
      {/* MOBILE: Top-Left Story Icon */}
      <div className="md:hidden fixed top-5 left-5 z-50">
        <button onClick={() => setIsOpen(!isOpen)} className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-tr from-red-500 to-orange-500 rounded-full opacity-70 animate-pulse blur-sm"></div>
          <div className="relative w-11 h-11 bg-white rounded-full flex items-center justify-center border-[3px] border-white shadow-lg overflow-hidden">
             {getPlatformIcon(current.platform, "w-6 h-6 text-gray-800")}
          </div>
          {total > 1 && <div className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">{total}</div>}
        </button>

        {isOpen && (
          <div className="absolute top-16 left-0 w-72 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 p-4 animate-in slide-in-from-top-4 fade-in duration-200">
             <div className="flex justify-between items-center mb-3">
                <span className="text-[11px] font-bold text-red-500 uppercase tracking-wider flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 fill-current" /> Live Now</span>
                <button onClick={() => setIsOpen(false)}><X className="w-4 h-4 text-gray-400" /></button>
             </div>
             <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gray-50 rounded-xl">{getPlatformIcon(current.platform)}</div>
                <div className="flex-1 min-w-0">
                   <h4 className="text-sm font-bold text-gray-900 truncate">{current.name}</h4>
                   <p className="text-xs text-gray-500 mt-0.5">{current.duration}</p>
                </div>
             </div>
             <LiveProgressBar startTime={current.startTime} endTime={current.endTime} />
             <div className="mt-4 flex gap-2">
                <a href={current.url} target="_blank" className="flex-1 bg-gray-900 text-white text-xs font-bold py-2.5 rounded-xl text-center shadow-lg shadow-gray-200 hover:bg-black transition-all">Enter Contest</a>
                {total > 1 && <button onClick={handleNext} className="px-3 bg-gray-100 rounded-xl hover:bg-gray-200"><ChevronRight className="w-4 h-4 text-gray-600" /></button>}
             </div>
          </div>
        )}
      </div>

      {/* DESKTOP: Bottom-Right Stack */}
      <div className="hidden md:flex flex-col gap-3 fixed bottom-8 right-8 z-50 w-80">
        {liveContests.map((contest, idx) => (
          <div key={idx} className="bg-white/90 backdrop-blur-md rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20 p-5 animate-in slide-in-from-right-10 fade-in duration-300">
             <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                   <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span></span>
                   <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">Live • {contest.platform}</span>
                </div>
                <a href={contest.url} target="_blank" className="text-gray-400 hover:text-blue-600 transition-colors"><ExternalLink className="w-4 h-4" /></a>
             </div>
             <h3 className="text-sm font-bold text-gray-900 mb-1 leading-snug">{contest.name}</h3>
             <div className="flex justify-between text-xs text-gray-500 font-medium">
                <span>Ends {format(new Date(contest.endTime), "h:mm a")}</span>
                <span>{contest.duration}</span>
             </div>
             <LiveProgressBar startTime={contest.startTime} endTime={contest.endTime} />
          </div>
        ))}
      </div>
    </>
  );
}