import React from 'react';
import StoreItemCard from '@/components/store/StoreItemCard';

// kind: 'color' | 'knob'. Previews each item combined with the other equipped part.
export default function StoreSection({ title, kind, items, state, equippedSkin, balance, onBuy, onEquip }) {
  return (
    <div className="mb-6">
      <div className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground mb-3">{title}</div>
      <div className="grid grid-cols-3 gap-2.5">
        {items.map((item) => (
          <StoreItemCard
            key={item.id}
            item={item}
            skin={{ ...equippedSkin, [kind]: item }}
            owned={state.owned.includes(item.id)}
            equipped={state[kind] === item.id}
            canAfford={balance >= item.cost}
            onBuy={() => onBuy(item, kind)}
            onEquip={() => onEquip(kind, item.id)}
          />
        ))}
      </div>
    </div>
  );
}