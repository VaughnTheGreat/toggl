import React from 'react';
import { Star } from 'lucide-react';
import { rankFor, BADGES } from '@/lib/game/ranks';
import { getBadges } from '@/lib/game/storage';

export default function RankProgress({ totalStars }) {
  const rank = rankFor(totalStars);
  const owned = getBadges();
  const pct = rank.next
    ? Math.min(100, Math.round(((totalStars - rank.min) / (rank.next.min - rank.min)) * 100))
    : 100;

  return (
    <div className="bg-card rounded-3xl shadow-sm p-5 mb-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Rank</div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-4xl font-extrabold tabular-nums">{totalStars}</span>
        <Star className="w-5 h-5 text-[#F5B21B] fill-[#F5B21B] self-center" />
        <span className="text-lg font-extrabold text-[#00A38C]">{rank.title}</span>
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden mb-1.5">
        <div className="h-full rounded-full bg-gradient-to-r from-[#00CDAF] to-[#00A88F]" style={{ width: `${pct}%` }} />
      </div>
      {rank.next && (
        <div className="text-right text-xs font-semibold text-muted-foreground mb-3">
          {rank.next.min - totalStars} stars to {rank.next.title}
        </div>
      )}
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(BADGES).map(([id, b]) => (
          <span
            key={id}
            title={b.desc}
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              owned[id] ? 'bg-[#00C2A8]/10 text-[#00806E] dark:text-[#2BD9BF]' : 'bg-muted text-[#B4BACA]'
            }`}
          >
            {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}