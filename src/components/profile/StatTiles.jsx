import React from 'react';
import { getStars, getEndlessLevel } from '@/lib/game/storage';

export default function StatTiles() {
  const stars = getStars();
  const tiles = [
    { value: Object.keys(stars).length, label: 'Levels Cleared', color: 'text-[#00A38C]' },
    { value: Object.values(stars).filter((s) => s === 3).length, label: 'Perfect Solves', color: 'text-[#F5B21B]' },
    { value: Math.max(getEndlessLevel() - 1, 0), label: 'Endless Best', color: 'text-violet-500' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2.5 mb-4">
      {tiles.map((t) => (
        <div key={t.label} className="bg-card rounded-3xl shadow-sm p-4">
          <div className={`text-2xl font-extrabold tabular-nums ${t.color}`}>{t.value}</div>
          <div className="text-[11px] font-semibold text-muted-foreground leading-tight">{t.label}</div>
        </div>
      ))}
    </div>
  );
}