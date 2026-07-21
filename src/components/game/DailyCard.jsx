import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, CheckCircle2, ChevronRight } from 'lucide-react';
import { getDaily, isDailyDone } from '@/lib/game/storage';

export default function DailyCard() {
  const done = isDailyDone();
  const { streak } = getDaily();

  return (
    <Link to="/play?daily=1" className="flex items-center gap-4 bg-white rounded-3xl shadow-sm p-4 mb-4 active:scale-[0.98] transition-transform">
      <div className="w-12 h-12 rounded-2xl bg-orange-100 flex items-center justify-center">
        <Flame className="w-6 h-6 text-orange-500" />
      </div>
      <div className="flex-1">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A91A5]">Daily Challenge</div>
        <div className="text-base font-extrabold">
          {done ? 'Completed today' : 'Today\u2019s puzzle awaits'}
        </div>
        <div className="text-xs font-semibold text-[#8A91A5]">
          {streak > 0 ? `${streak}-day streak` : 'Start your streak'}
        </div>
      </div>
      {done ? (
        <CheckCircle2 className="w-5 h-5 text-[#00A38C]" />
      ) : (
        <ChevronRight className="w-5 h-5 text-[#B4BACA]" />
      )}
    </Link>
  );
}