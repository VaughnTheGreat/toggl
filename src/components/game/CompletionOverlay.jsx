import React from 'react';
import { Star } from 'lucide-react';

export default function CompletionOverlay({ result, level, hasNext, onNext, onRetry, onMenu }) {
  return (
    <div className="fixed inset-0 z-50 bg-[#0A0C10]/92 backdrop-blur-sm flex items-center justify-center px-6" role="dialog" aria-label="Level complete">
      <div className="w-full max-w-sm border border-[#1E2128] rounded bg-[#0E1116] p-6">
        <div className="text-[10px] uppercase tracking-[0.3em] text-[#00E5C8] mb-1">System matched</div>
        <div className="text-xl font-bold mb-5">{level.name}</div>
        <div className="flex gap-2 mb-6" aria-label={`${result.stars} of 3 stars`}>
          {[1, 2, 3].map((n) => (
            <Star
              key={n}
              className={`w-8 h-8 ${n <= result.stars ? 'text-[#00E5C8] fill-[#00E5C8]' : 'text-[#2A2F3E]'}`}
              style={{ animation: n <= result.stars ? `lg-pop 0.3s ease ${n * 0.15}s backwards` : undefined }}
            />
          ))}
        </div>
        <div className="text-xs text-[#6B7280] space-y-1.5 mb-6">
          <div className="flex justify-between"><span>Moves</span><span className="text-[#F0F2F5]">{result.moves} / {level.optimalMoves} optimal</span></div>
          <div className="flex justify-between"><span>Time</span><span className="text-[#F0F2F5]">{result.time}s</span></div>
          <div className="flex justify-between"><span>Hints used</span><span className="text-[#F0F2F5]">{result.hints}</span></div>
          <div className="flex justify-between"><span>Undos</span><span className="text-[#F0F2F5]">{result.undos}</span></div>
        </div>
        <div className="flex flex-col gap-2">
          {hasNext && (
            <button onClick={onNext} className="w-full py-3 rounded bg-[#00E5C8] text-[#0A0C10] font-bold text-sm tracking-widest uppercase">
              Next Level
            </button>
          )}
          <div className="flex gap-2">
            <button onClick={onRetry} className="flex-1 py-3 rounded border border-[#2A2F3E] text-sm uppercase tracking-widest">Retry</button>
            <button onClick={onMenu} className="flex-1 py-3 rounded border border-[#2A2F3E] text-sm uppercase tracking-widest">Levels</button>
          </div>
        </div>
      </div>
    </div>
  );
}