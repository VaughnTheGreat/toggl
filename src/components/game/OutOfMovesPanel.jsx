import React from 'react';
import { Star, Plus, RotateCcw } from 'lucide-react';

// Shown when the move limit is hit: spend stars for more moves, or reset.
export default function OutOfMovesPanel({ cost, balance, canBuy, onBuy, onReset }) {
  const affordable = balance >= cost;
  return (
    <div className="mt-4 px-4 py-4 rounded-2xl bg-card shadow-sm">
      <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">Out of moves</div>
      <div className="text-xs font-semibold text-muted-foreground mt-1 leading-relaxed">
        {canBuy
          ? 'Keep going with 3 extra moves. Levels finished with bought moves earn 1 star.'
          : 'This state can no longer reach the target — extra moves won’t help.'}
      </div>
      <div className="flex items-center gap-2.5 mt-3">
        {canBuy && (
          <button onClick={onBuy} disabled={!affordable}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-[#00A38C] text-white text-[11px] font-bold uppercase tracking-widest disabled:opacity-40 active:scale-95 transition-transform">
            <Plus className="w-3.5 h-3.5" /> 3 moves · {cost}
            <Star className="w-3 h-3 fill-current" />
          </button>
        )}
        <button onClick={onReset}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-secondary text-[11px] font-bold uppercase tracking-widest text-muted-foreground active:scale-95 transition-transform">
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
      <div className="text-[11px] font-bold text-muted-foreground mt-2.5">
        You have <span className="text-foreground">{balance}</span> star{balance === 1 ? '' : 's'} to spend
        {canBuy && !affordable && ' — earn more by beating your best on earlier levels'}.
      </div>
    </div>
  );
}