import React from 'react';
import { Check } from 'lucide-react';
import { groupOn, describeObjective } from '@/lib/game/objective';

export default function IslandTarget({ level, states }) {
  return (
    <div className="bg-card rounded-2xl shadow-sm px-4 py-3.5">
      <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Target</div>
      <div className="text-sm font-bold mb-2.5">{describeObjective(level)}</div>
      <div className="flex flex-wrap gap-2">
        {level.objective.groups.map((g, i) => {
          const current = groupOn(states, g);
          const met = current === g.count;
          return (
            <div key={i} className={`flex items-center gap-1.5 pl-3 pr-2.5 py-1.5 rounded-full text-xs font-extrabold border ${
              met ? 'bg-[#00C2A8]/10 border-[#00C2A8]/40 text-[#00A38C]' : 'bg-muted border-border text-muted-foreground'
            }`}>
              Island {i + 1}
              <span className="font-mono">{current}/{g.count} ON</span>
              {met && <Check className="w-3.5 h-3.5" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}