import React, { useId } from 'react';

// Toggl's streak flame: a solid two-tone flame on Lucide's 24×24 grid (size it with w-/h- classes).
// The core uses the reward-star gold. Gradient ids are per instance so several flames can share a screen.
export default function FlameIcon({ className = 'w-6 h-6' }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${id}-outer`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FF9F43" />
          <stop offset="1" stopColor="#F2542D" />
        </linearGradient>
        <linearGradient id={`${id}-core`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE38A" />
          <stop offset="1" stopColor="#F5B21B" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id}-outer)`}
        d="M12 2c.6 3.2 3.2 4.9 4.9 7.1 1.5 1.9 2.3 3.8 2.3 5.9 0 4-3.2 7-7.2 7s-7.2-3-7.2-7c0-2.4 1.1-4.4 2.6-5.8.2 1.7 1 2.8 2.2 3.3C9.2 8.6 10.4 5.1 12 2z"
      />
      <path
        fill={`url(#${id}-core)`}
        d="M12 11.2c.5 1.8 2.6 3 2.6 5.6 0 1.8-1.2 3.1-2.6 3.1s-2.6-1.3-2.6-3c0-1.7 1.2-2.6 1.7-3.8.4-.6.7-1.2.9-1.9z"
      />
    </svg>
  );
}
