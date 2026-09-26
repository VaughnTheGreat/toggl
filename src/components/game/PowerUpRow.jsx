import React from 'react';
import { Star } from 'lucide-react';

export default function PowerUpRow({ Icon, iconClass, title, desc, cost, disabled, onBuy }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-background">
      <div className="w-9 h-9 rounded-full bg-card shadow-sm flex items-center justify-center shrink-0">
        <Icon className={`w-4 h-4 ${iconClass}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-extrabold">{title}</div>
        <div className="text-[11px] font-semibold text-muted-foreground leading-snug">{desc}</div>
      </div>
      <button onClick={onBuy} disabled={disabled}
        className="flex items-center gap-1 px-3.5 py-2 rounded-full bg-[#00A38C] text-white text-xs font-extrabold tabular-nums disabled:opacity-35 active:scale-95 transition-transform shrink-0">
        {cost} <Star className="w-3.5 h-3.5 text-[#F5B21B] fill-[#F5B21B]" />
      </button>
    </div>
  );
}