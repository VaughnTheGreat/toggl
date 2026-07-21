import React from 'react';

export default function Toggle({ on, locked, dim, colorblind, reducedMotion }) {
  const dur = reducedMotion ? '' : 'transition-all duration-150 ease-linear';
  return (
    <div
      className={`relative w-14 h-8 rounded flex items-center px-1 shrink-0 ${dur} ${
        locked
          ? 'bg-[#241c0e] border border-amber-600/50'
          : on
          ? 'bg-[#00E5C8] shadow-[0_0_12px_rgba(0,229,200,0.35)]'
          : 'bg-[#1E2128] border border-[#2A2F3E]'
      } ${dim ? 'opacity-40' : ''}`}
      style={colorblind && on && !locked ? { backgroundImage: 'repeating-linear-gradient(45deg,#00E5C8 0 5px,#00b89f 5px 10px)' } : undefined}
    >
      <div
        className={`w-5 h-5 rounded-sm ${dur} ${
          on ? 'translate-x-[26px] bg-[#0A0C10]' : 'translate-x-0 bg-transparent border-2 border-[#6B7280]'
        }`}
      />
    </div>
  );
}