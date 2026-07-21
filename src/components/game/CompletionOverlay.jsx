import React from 'react';
import { Star, Flame } from 'lucide-react';
import { BADGES } from '@/lib/game/ranks';

export default function CompletionOverlay({ result, level, hasNext, onNext, onRetry, onMenu }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#1B2340]/50 backdrop-blur-sm flex items-center justify-center px-6" role="dialog" aria-label="Level complete">
      <div className="w-full max-w-sm bg-card rounded-3xl shadow-xl p-6">
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#00A38C] mb-1">System matched!</div>
        <div className="text-2xl font-extrabold mb-5">{level.name}</div>
        <div className="flex justify-center gap-3 mb-6" aria-label={`${result.stars} of 3 stars`}>
          {[1, 2, 3].map((n) => (
            <Star
              key={n}
              className={`w-12 h-12 ${n <= result.stars ? 'text-[#F5B21B] fill-[#F5B21B]' : 'text-muted fill-muted'}`}
              style={{ animation: n <= result.stars ? `lg-pop 0.3s ease ${n * 0.15}s backwards` : undefined }}
            />
          ))}
        </div>
        <div className="bg-muted rounded-2xl px-4 py-3 text-xs font-semibold text-muted-foreground space-y-2 mb-6">
          <div className="flex justify-between"><span>Moves</span><span className="text-foreground">{result.moves} / {level.optimalMoves} optimal</span></div>
          <div className="flex justify-between"><span>Time</span><span className="text-foreground">{result.time}s</span></div>
          <div className="flex justify-between"><span>Hints used</span><span className="text-foreground">{result.hints}</span></div>
          <div className="flex justify-between"><span>Undos</span><span className="text-foreground">{result.undos}</span></div>
        </div>
        {result.streak != null && (
          <div className="flex items-center justify-center gap-1.5 bg-orange-50 dark:bg-orange-500/10 rounded-2xl px-4 py-3 mb-4 text-sm font-extrabold text-orange-600 dark:text-orange-400">
            <Flame className="w-4 h-4" /> {result.streak}-day streak
          </div>
        )}
        {result.newBadges?.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mb-6">
            {result.newBadges.map((id) => (
              <span key={id} className="px-2.5 py-1 rounded-full bg-[#00C2A8]/10 text-[10px] font-bold uppercase tracking-wider text-[#00806E] dark:text-[#2BD9BF]">
                +{BADGES[id].label}
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-2.5">
          {hasNext && (
            <button onClick={onNext} className="w-full py-4 rounded-full bg-gradient-to-b from-[#00CDAF] to-[#00A88F] text-white font-extrabold text-sm tracking-widest uppercase shadow-[0_4px_14px_rgba(0,194,168,0.4)] active:scale-[0.98] transition-transform">
              Next Level
            </button>
          )}
          <div className="flex gap-2.5">
            <button onClick={onRetry} className="flex-1 py-3.5 rounded-full bg-muted text-sm font-bold uppercase tracking-widest text-foreground active:scale-[0.98] transition-transform">Retry</button>
            <button onClick={onMenu} className="flex-1 py-3.5 rounded-full bg-muted text-sm font-bold uppercase tracking-widest text-foreground active:scale-[0.98] transition-transform">Levels</button>
          </div>
        </div>
      </div>
    </div>
  );
}