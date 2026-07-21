import React from 'react';

export default function Toggle({ on, locked, dim, colorblind, reducedMotion }) {
  const spring = reducedMotion ? '' : 'transition-all duration-300 [transition-timing-function:cubic-bezier(0.34,1.8,0.64,1)]';
  const bgDur = reducedMotion ? '' : 'transition-all duration-200';
  return (
    <div
      className={`relative w-14 h-8 rounded-full flex items-center px-1 shrink-0 ${bgDur} ${
        locked
          ? 'bg-amber-100 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/40'
          : on
          ? 'bg-[#00C2A8] shadow-[0_2px_12px_rgba(0,194,168,0.55)]'
          : 'bg-[#E3E7EF] dark:bg-[#0E1330]'
      } ${dim ? 'opacity-40' : ''}`}
      style={colorblind && on && !locked ? { backgroundImage: 'repeating-linear-gradient(45deg,#00C2A8 0 5px,#00a48d 5px 10px)' } : undefined}
    >
      <div
        className={`w-6 h-6 rounded-full bg-white shadow-md ${spring} ${on ? 'translate-x-[24px]' : 'translate-x-0'}`}
      />
    </div>
  );
}