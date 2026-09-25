import React from 'react';
import { Hand } from 'lucide-react';

// Levels 1–5 double as the tutorial: one short tip per level.
export const COACH_TIPS = {
  1: 'Tap switch A to turn it on. Make the System match the Target to win.',
  2: 'Each switch flips only itself. Turn both of them on.',
  3: 'Switches turn off too. Flip every switch to its opposite.',
  4: 'Only touch what needs changing — every tap costs a move.',
  5: 'Watch the move counter. Solve in the fewest moves to earn 3 stars.',
};

export default function LevelCoach({ levelId }) {
  const tip = COACH_TIPS[levelId];
  if (!tip) return null;
  return (
    <div className="bg-card rounded-2xl shadow-sm px-4 py-3 mb-4 flex gap-3 items-start">
      <Hand className="w-4 h-4 text-[#00A38C] shrink-0 mt-0.5" />
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00A38C]">Tutorial · {levelId}/5</div>
        <div className="text-sm font-semibold mt-0.5 leading-snug">{tip}</div>
      </div>
    </div>
  );
}