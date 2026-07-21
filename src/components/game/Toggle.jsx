import React from 'react';

export default function Toggle({ on, locked, dim, colorblind, reducedMotion }) {
  const dur = reducedMotion ? '' : 'transition-all duration-150';
  return (
    <div
      className={`relative w-14 h-8 rounded-full flex items-center px-1 shrink-0 ${dur} ${
        locked
          ? 'bg-amber-100 border border-amber-300'
          : on
          ? 'bg-[#00C2A8] shadow-[0_2px_8px_rgba(0,194,168,0.4)]'
          : 'bg-[#E3E7EF]'
      } ${dim ? 'opacity-40' : ''}`}
      style={colorblind && on && !locked ? { backgroundImage: 'repeating-linear-gradient(45deg,#00C2A8 0 5px,#00a48d 5px 10px)' } : undefined}
    >
      <div
        className={`w-6 h-6 rounded-full bg-white shadow-md ${dur} ${on ? 'translate-x-[24px]' : 'translate-x-0'}`}
      />
    </div>
  );
}