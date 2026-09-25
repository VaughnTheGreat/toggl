import React from 'react';
import { Check } from 'lucide-react';
import { countOn, describeObjective } from '@/lib/game/objective';

export default function TargetPanel({ level, buttons, target, states }) {
  if (level?.objective?.type === 'count') {
    const current = countOn(states, level);
    const need = level.objective.count;
    const met = current === need;
    return (
      <div className="bg-card rounded-2xl shadow-sm px-4 py-3.5">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2.5">Target</div>
        <div className="flex items-center justify-between">
          <div className="text-sm font-bold">{describeObjective(level)}</div>
          <div className={`flex items-center gap-1.5 pl-3 pr-2.5 py-1.5 rounded-full text-sm font-extrabold font-mono border ${
            met
              ? 'bg-[#00C2A8]/10 border-[#00C2A8]/40 text-[#00A38C]'
              : 'bg-muted border-border text-muted-foreground'
          }`}>
            {current} / {need}
            {met && <Check className="w-3.5 h-3.5" />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-sm px-4 py-3.5">
      <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2.5">Target</div>
      <div className="flex flex-wrap gap-2">
        {buttons.map((b) => {
          const want = !!target[b.id];
          const matched = !!states[b.id] === want;
          return (
            <div
              key={b.id}
              className={`flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full text-xs font-extrabold font-mono border ${
                want
                  ? 'bg-[#00C2A8]/10 border-[#00C2A8]/40 text-[#00A38C]'
                  : 'bg-muted border-border text-muted-foreground'
              } ${matched ? 'opacity-45' : ''}`}
            >
              {b.id}
              <span className={`px-1.5 py-0.5 rounded-full text-[11px] tracking-widest ${
                want ? 'bg-[#00C2A8] text-white' : 'bg-[#B4BACA]/30 text-muted-foreground'
              }`}>{want ? 'ON' : 'OFF'}</span>
              {matched && <Check className="w-3.5 h-3.5" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}