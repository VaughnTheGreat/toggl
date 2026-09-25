import React from 'react';

// Circular timer that drains over `seconds`; wraps its children (the continue button).
export default function CountdownRing({ seconds, children }) {
  const r = 46;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative w-28 h-28">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="6" className="stroke-secondary" />
        <circle cx="50" cy="50" r={r} fill="none" strokeWidth="6" strokeLinecap="round"
          stroke="#00A38C" strokeDasharray={c} strokeDashoffset="0"
          style={{ animation: `lg-drain ${seconds}s linear forwards`, '--lg-c': c }} />
      </svg>
      <div className="absolute inset-[10px]">{children}</div>
    </div>
  );
}