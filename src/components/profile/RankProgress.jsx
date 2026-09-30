import React, { useState } from 'react';
import { Star, ChevronRight } from 'lucide-react';
import RankLadderSheet from '@/components/profile/RankLadderSheet';
import { rankFor, BADGES } from '@/lib/game/ranks';
import { getBadges, getRankedClears } from '@/lib/game/storage';

export default function RankProgress() {
  const cleared = getRankedClears();
  const rank = rankFor(cleared);
  const owned = getBadges();
  const [showAll, setShowAll] = useState(false);
  const pct = rank.next
    ? Math.min(100, Math.round(((cleared - rank.min) / (rank.next.min - rank.min)) * 100))
    : 100;

  return (
    <div className="bg-card rounded-3xl shadow-sm p-5 mb-4">
      <RankLadderSheet open={showAll} onOpenChange={setShowAll} currentIndex={rank.index} />
      <button onClick={() => setShowAll(true)} className="w-full text-left active:opacity-70 transition-opacity">
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5">
        Rank <span className="flex items-center gap-0.5 normal-case tracking-normal">All ranks <ChevronRight className="w-3.5 h-3.5" /></span>
      </div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-2xl font-extrabold text-[#00A38C]">{rank.title}</span>
        {rank.next && (
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#F5B21B]/15 text-sm font-extrabold text-foreground tabular-nums">
            +{rank.next.reward} <Star className="w-3.5 h-3.5 text-[#F5B21B] fill-[#F5B21B]" />
          </span>
        )}
      </div>
      <div className="h-2.5 rounded-full bg-muted overflow-hidden mb-1.5">
        <div className="h-full rounded-full bg-gradient-to-r from-[#00CDAF] to-[#00A88F]" style={{ width: `${pct}%` }} />
      </div>
      {rank.next && (
        <div className="text-right text-xs font-semibold text-muted-foreground mb-3">
          {rank.next.min - cleared} level{rank.next.min - cleared === 1 ? '' : 's'} to {rank.next.title} · rank-up reward
        </div>
      )}
      </button>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(BADGES).map(([id, b]) => (
          <span
            key={id}
            title={b.desc}
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
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