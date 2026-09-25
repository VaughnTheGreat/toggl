import React, { useEffect, useState } from 'react';
import { loadUserProgress } from '@/lib/game/backendSync';

export default function BackendProgressCard() {
  const [progress, setProgress] = useState(null);

  useEffect(() => {
    loadUserProgress().then(setProgress).catch(() => setProgress(null));
  }, []);

  if (!progress) return null;

  const tiles = [
    { value: progress.daily_streak || 0, label: 'Daily Streak' },
    { value: progress.current_perfect_streak || 0, label: 'Perfect Streak' },
    { value: progress.total_solves || 0, label: 'Total Solves' },
    { value: progress.total_attempts || 0, label: 'Total Attempts' },
    { value: `${progress.consistency_score || 0}%`, label: 'Consistency' },
  ];

  return (
    <div className="bg-card rounded-3xl shadow-sm p-5 mb-4">
      <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1.5">Rating</div>
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-extrabold tabular-nums">{progress.rating}</span>
        <span className="text-lg font-extrabold text-[#00A38C] capitalize">{progress.rank}</span>
      </div>
      <div className="grid grid-cols-3 gap-2.5">
        {tiles.map((t) => (
          <div key={t.label} className="bg-muted rounded-2xl p-3">
            <div className="text-lg font-extrabold tabular-nums">{t.value}</div>
            <div className="text-[11px] font-semibold text-muted-foreground leading-tight">{t.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}