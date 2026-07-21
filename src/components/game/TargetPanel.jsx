import React from 'react';
import { Check } from 'lucide-react';

export default function TargetPanel({ buttons, target, states }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.25em] text-[#6B7280] mb-2">Target</div>
      <div className="flex flex-wrap gap-2">
        {buttons.map((b) => {
          const want = !!target[b.id];
          const matched = !!states[b.id] === want;
          return (
            <div
              key={b.id}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded border text-xs font-bold tracking-wide ${
                want ? 'border-[#00E5C8]/50 text-[#00E5C8]' : 'border-[#2A2F3E] text-[#6B7280]'
              } ${matched ? 'opacity-45' : ''}`}
            >
              {b.id} {want ? '●' : '○'}
              {matched && <Check className="w-3 h-3" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}