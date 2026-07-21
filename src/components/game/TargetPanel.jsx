import React from 'react';
import { Check } from 'lucide-react';

export default function TargetPanel({ buttons, target, states }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm px-4 py-3.5">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A91A5] mb-2.5">Target</div>
      <div className="flex flex-wrap gap-2">
        {buttons.map((b) => {
          const want = !!target[b.id];
          const matched = !!states[b.id] === want;
          return (
            <div
              key={b.id}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold font-mono ${
                want ? 'bg-[#00C2A8]/10 text-[#00A38C]' : 'bg-[#F2F4F8] text-[#8A91A5]'
              } ${matched ? 'opacity-40' : ''}`}
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