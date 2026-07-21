import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, RotateCcw, Map, Flame } from 'lucide-react';
import { BADGES } from '@/lib/game/ranks';
import { playWin } from '@/lib/game/feedback';
import { getSettings } from '@/lib/game/storage';

const RANK_STYLES = {
  'Perfect Prediction': 'bg-[#00C2A8]/15 text-[#00806E] dark:text-[#2BD9BF]',
  Optimal: 'bg-[#F5B21B]/15 text-[#A97A08] dark:text-[#F5B21B]',
  Efficient: 'bg-sky-100 dark:bg-sky-500/15 text-sky-600 dark:text-sky-300',
  Solved: 'bg-muted text-muted-foreground',
};

export default function CompletionFlash({ result, level, hasNext, onNext, onRetry, onMenu }) {
  useEffect(() => {
    const s = getSettings();
    playWin(s.sound);
    if (!s.reducedMotion) {
      confetti({
        particleCount: result.stars * 25,
        spread: 75,
        startVelocity: 32,
        origin: { y: 0.7 },
        colors: ['#00C2A8', '#F5B21B', '#6C9EFF', '#ffffff'],
        disableForReducedMotion: true,
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center cursor-pointer"
      onClick={hasNext ? onNext : onMenu}
      role="dialog" aria-label="Level complete — tap to continue"
    >
      <div className="w-full max-w-md px-5 pb-8 pt-24 bg-gradient-to-t from-background via-background/90 to-transparent">
        <div className="bg-card rounded-3xl shadow-xl p-5 text-center">
          <div className="flex justify-center gap-1.5 mb-2.5">
            {[1, 2, 3].map((n) => (
              <Star key={n}
                className={`w-7 h-7 ${n <= result.stars ? 'text-[#F5B21B] fill-[#F5B21B]' : 'text-muted fill-muted'}`}
                style={{ animation: n <= result.stars ? `lg-pop 0.3s ease ${n * 0.12}s backwards` : undefined }}
              />
            ))}
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-[0.2em] ${RANK_STYLES[result.rank] || RANK_STYLES.Solved}`}>
            {result.rank}
          </span>
          <div className="text-[11px] font-semibold text-muted-foreground mt-2">
            {result.moves} moves · optimal {level.optimalMoves}{result.skipped && ' · next level skipped'}
          </div>
          {result.streak != null && (
            <div className="flex items-center justify-center gap-1 mt-2 text-xs font-extrabold text-orange-600 dark:text-orange-400">
              <Flame className="w-3.5 h-3.5" /> {result.streak}-day streak
            </div>
          )}
          {result.newBadges?.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5 mt-2">
              {result.newBadges.map((id) => (
                <span key={id} className="px-2 py-0.5 rounded-full bg-[#00C2A8]/10 text-[9px] font-bold uppercase tracking-wider text-[#00806E] dark:text-[#2BD9BF]">
                  +{BADGES[id].label}
                </span>
              ))}
            </div>
          )}
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground mt-4 animate-pulse">
            {hasNext ? 'Tap to continue' : 'Tap to finish'}
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <button onClick={(e) => { e.stopPropagation(); onRetry(); }} aria-label="Retry"
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onMenu(); }} aria-label="Level map"
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform">
              <Map className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}