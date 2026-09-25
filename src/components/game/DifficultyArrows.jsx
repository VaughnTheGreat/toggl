import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

// Minimal difficulty cue: one down arrow for a breather, 1–3 up arrows by solution depth.
export default function DifficultyArrows({ level }) {
  if (level.tier === 'Breather') {
    return <ChevronDown className="w-5 h-5 text-muted-foreground" strokeWidth={3} aria-label="Easier level" />;
  }
  const count = level.optimalMoves <= 3 ? 1 : level.optimalMoves <= 7 ? 2 : 3;
  return (
    <div className="flex flex-col items-center -space-y-2.5" aria-label={`Difficulty ${count} of 3`}>
      {Array.from({ length: count }, (_, i) => (
        <ChevronUp key={i} className="w-5 h-5 text-[#00A38C]" strokeWidth={3} />
      ))}
    </div>
  );
}