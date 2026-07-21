import React from 'react';
import { Award, Star } from 'lucide-react';
import { rankFor, BADGES } from '@/lib/game/ranks';
import { getBadges } from '@/lib/game/storage';

export default function RankCard({ totalStars }) {
  const rank = rankFor(totalStars);
  const owned = getBadges();

  return (
    <div className="bg-white rounded-3xl shadow-sm p-4 mb-8">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center">
          <Award className="w-6 h-6 text-indigo-500" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A91A5]">Rank</div>
          <div className="text-base font-extrabold">{rank.title}</div>
          {rank.next && (
            <div className="text-xs font-semibold text-[#8A91A5] flex items-center gap-1">
              {rank.next.min - totalStars} more <Star className="w-3 h-3 text-[#F5B21B] fill-[#F5B21B]" /> to {rank.next.title}
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(BADGES).map(([id, b]) => (
          <span
            key={id}
            title={b.desc}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              owned[id] ? 'bg-[#00C2A8]/10 text-[#00806E]' : 'bg-[#F2F4F8] text-[#B4BACA]'
            }`}
          >
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}