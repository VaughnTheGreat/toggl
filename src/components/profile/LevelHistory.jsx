import React from 'react';
import { Star, Trophy } from 'lucide-react';
import { getLevelStats, getStars, getUnlocked } from '@/lib/game/storage';
import { LEVELS } from '@/lib/game/levels';

export default function LevelHistory() {
  const stats = getLevelStats();
  const stars = getStars();
  const unlocked = getUnlocked();

  const played = [];
  for (let id = 1; id < unlocked; id++) {
    const stat = stats[id];
    const starCount = stars[id] || 0;
    if (!stat && !starCount) continue;
    const def = LEVELS.find((l) => l.id === id);
    played.push({
      id,
      name: def?.name || `Level ${id}`,
      optimalMoves: def?.optimalMoves,
      bestMoves: stat?.bestMoves,
      solves: stat?.solves || 0,
      stars: starCount,
    });
  }
  if (!played.length) return null;
  played.sort((a, b) => b.id - a.id);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-4 h-4 text-[#00A38C]" />
        <h2 className="text-sm font-extrabold uppercase tracking-widest">Level History</h2>
      </div>
      <div className="bg-card rounded-2xl shadow-sm divide-y divide-border max-h-80 overflow-y-auto">
        {played.map((l) => (
          <div key={l.id} className="flex items-center gap-3 px-4 py-2.5">
            <div className="text-xs font-extrabold text-muted-foreground w-7 shrink-0 text-right">{l.id}</div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{l.name}</div>
              <div className="text-[11px] text-muted-foreground">
                {l.bestMoves != null ? `Best: ${l.bestMoves}${l.optimalMoves ? ` / ${l.optimalMoves} optimal` : ''} moves` : 'Not solved'}
                {l.solves > 1 ? ` · ${l.solves} solves` : ''}
              </div>
            </div>
            <div className="flex gap-0.5 shrink-0">
              {[1, 2, 3].map((n) => (
                <Star key={n} className={`w-3.5 h-3.5 ${n <= l.stars ? 'text-[#F5B21B] fill-[#F5B21B]' : 'text-muted fill-muted'}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}