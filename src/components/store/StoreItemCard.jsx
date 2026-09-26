import React from 'react';
import { Star, Check } from 'lucide-react';
import Toggle from '@/components/game/Toggle';

export default function StoreItemCard({ item, skin, owned, equipped, canAfford, onBuy, onEquip }) {
  return (
    <div className={`bg-card rounded-2xl shadow-sm p-3 flex flex-col items-center gap-2.5 ${equipped ? 'ring-2 ring-[#00A38C]' : ''}`}>
      <div className="py-2"><Toggle on skin={skin} /></div>
      <div className="text-xs font-extrabold truncate max-w-full">{item.name}</div>
      {equipped ? (
        <div className="w-full flex items-center justify-center gap-1 py-2 rounded-full bg-[#00A38C]/15 text-[#00A38C] text-[11px] font-extrabold uppercase tracking-wider">
          <Check className="w-3.5 h-3.5" /> Equipped
        </div>
      ) : owned ? (
        <button onClick={onEquip} className="w-full py-2 rounded-full bg-muted text-[11px] font-extrabold uppercase tracking-wider active:scale-95 transition-transform">
          Equip
        </button>
      ) : (
        <button onClick={onBuy} disabled={!canAfford}
          className="w-full flex items-center justify-center gap-1 py-2 rounded-full bg-[#00A38C] text-white text-xs font-extrabold tabular-nums disabled:opacity-35 active:scale-95 transition-transform">
          {item.cost} <Star className="w-3.5 h-3.5 text-[#F5B21B] fill-[#F5B21B]" />
        </button>
      )}
    </div>
  );
}