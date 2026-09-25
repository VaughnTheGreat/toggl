import React from 'react';

export default function RuleCard({ info, isNew }) {
  const { Icon, name, desc, example } = info;
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-muted/60 px-3.5 py-2.5">
      <span className="w-8 h-8 rounded-xl bg-[#00C2A8]/10 text-[#00A38C] flex items-center justify-center shrink-0 mt-0.5">
        <Icon className="w-4 h-4" />
      </span>
      <span>
        <span className="flex items-center gap-1.5 text-sm font-bold">
          {name}
          {isNew && <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#00A38C] bg-[#00C2A8]/10 rounded-full px-1.5 py-0.5">New</span>}
        </span>
        <span className="block text-[11px] font-semibold text-muted-foreground leading-relaxed">{desc}</span>
        <span className="block text-[11px] font-semibold text-foreground/80 mt-1 leading-relaxed">e.g. {example}</span>
      </span>
    </div>
  );
}