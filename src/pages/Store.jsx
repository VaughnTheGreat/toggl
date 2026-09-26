import React, { useState } from 'react';
import { Star } from 'lucide-react';
import Screen from '@/components/game/Screen';
import BottomNav from '@/components/game/BottomNav';
import StoreSection from '@/components/store/StoreSection';
import DailyCard from '@/components/game/DailyCard';
import { getStarBalance } from '@/lib/game/storage';
import { COLORS, KNOBS, PATTERNS, TRACKS, getSkinState, getEquippedSkin, buySkin, equipSkin } from '@/lib/game/skins';
import { playClick, vibrate } from '@/lib/game/feedback';
import { getSettings, rankMultiplier } from '@/lib/game/storage';

export default function Store() {
  const [, setTick] = useState(0);
  const refresh = () => setTick((n) => n + 1);
  const balance = getStarBalance();
  const state = getSkinState();
  const equippedSkin = getEquippedSkin();

  const onEquip = (kind, id) => {
    const s = getSettings();
    playClick(s.sound);
    vibrate(s.haptics, 15);
    equipSkin(kind, id);
    refresh();
  };

  const onBuy = (item, kind) => {
    if (buySkin(item)) onEquip(kind, item.id);
  };

  return (
    <Screen className="pb-28">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-extrabold">Star Store</h1>
        <div className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-card shadow-sm text-sm font-extrabold tabular-nums">
          {balance} <Star className="w-4 h-4 text-[#F5B21B] fill-[#F5B21B]" />
        </div>
      </div>
      <p className="text-[11px] font-semibold text-muted-foreground mb-4">
        Customize your switches. Your rank boosts every star you earn: {rankMultiplier()}×.
      </p>
      <div className="mb-6"><DailyCard /></div>
      <StoreSection title="Switch colors" kind="color" items={COLORS} state={state}
        equippedSkin={equippedSkin} balance={balance} onBuy={onBuy} onEquip={onEquip} />
      <StoreSection title="Patterns" kind="color" items={PATTERNS} state={state}
        equippedSkin={equippedSkin} balance={balance} onBuy={onBuy} onEquip={onEquip} />
      <StoreSection title="Knob styles" kind="knob" items={KNOBS} state={state}
        equippedSkin={equippedSkin} balance={balance} onBuy={onBuy} onEquip={onEquip} />
      <StoreSection title="Switch shapes" kind="track" items={TRACKS} state={state}
        equippedSkin={equippedSkin} balance={balance} onBuy={onBuy} onEquip={onEquip} />
      <BottomNav active="store" />
    </Screen>
  );
}