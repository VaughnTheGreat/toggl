import React from 'react';
import { Star } from 'lucide-react';

// A star amount in Toggl's usual style: the number followed by the gold star.
// `pill` matches the reward pill on the Rank card.
export default function StarAmount({ value, plus = false, pill = false, className = '' }) {
  const label = `${plus ? '+' : ''}${value}`;
  if (pill) {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#F5B21B]/15 text-xs font-extrabold text-[#B7791F] dark:text-[#F5B21B] tabular-nums whitespace-nowrap ${className}`}>
        {label} <Star className="w-3 h-3 fill-current" aria-hidden="true" />
        <span className="sr-only">stars</span>
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-0.5 align-[-2px] font-extrabold text-foreground tabular-nums whitespace-nowrap ${className}`}>
      {label}<Star className="w-3 h-3 text-[#F5B21B] fill-[#F5B21B]" aria-hidden="true" />
      <span className="sr-only"> stars</span>
    </span>
  );
}
