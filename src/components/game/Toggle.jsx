import React from 'react';
import Knob from '@/components/game/Knob';
import { getEquippedSkin } from '@/lib/game/skins';

export default function Toggle({ on, locked, dim, colorblind, reducedMotion, skin }) {
  const { color, knob, track } = skin || getEquippedSkin();
  const spring = reducedMotion ? '' : 'transition-all duration-300 [transition-timing-function:cubic-bezier(0.34,1.8,0.64,1)]';
  const bgDur = reducedMotion ? '' : 'transition-all duration-200';
  const onStyle = on && !locked
    ? colorblind
      ? { backgroundImage: 'repeating-linear-gradient(45deg,#00C2A8 0 5px,#00a48d 5px 10px)' }
      : { background: color.bg, boxShadow: `0 2px 12px ${color.glow}8C` }
    : undefined;
  return (
    <div
      className={`relative w-14 h-8 flex items-center px-1 shrink-0 ${bgDur} ${
        locked
          ? 'bg-amber-100 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-500/40'
          : on ? '' : 'bg-[#E3E7EF] dark:bg-[#0E1330]'
      } ${dim ? 'opacity-40' : ''}`}
      style={{ borderRadius: track.radius, ...onStyle }}
    >
      <Knob knob={knob} className={`w-6 h-6 ${spring} ${on ? 'translate-x-[24px]' : 'translate-x-0'}`} />
    </div>
  );
}