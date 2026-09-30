import React from 'react';
import { Star } from 'lucide-react';

// A star amount in Toggl's usual style: the number in the normal text colour followed by the
// in-game gold star. `pill` adds the soft gold background used for rewards.
export default function StarAmount({ value, plus = false, pill = false, className = '' }) {
  const label = `${plus ? '+' : ''}${value}`;
  const shape = pill
    ? 'gap-1 px-2.5 py-1 rounded-full bg-[#F5B21B]/15 text-xs'
    : 'gap-0.5 align-[-2px]';
  return (
    <span className={`inline-flex items-center font-extrabold text-foreground tabular-nums whitespace-nowrap ${shape} ${className}`}>
      {label}<Star className="w-3.5 h-3.5 text-[#F5B21B] fill-[#F5B21B]" aria-hidden="true" />
      <span className="sr-only"> stars</span>
    </span>
  );
}
