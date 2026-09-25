import React, { useState } from 'react';
import { Star, Lightbulb, Plus, Eye } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle, DrawerDescription } from '@/components/ui/drawer';
import PowerUpRow from '@/components/game/PowerUpRow';

// One small star pill on the board; everything else lives in a bottom sheet.
export default function PowerUpSheet({ balance, items }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Power-ups"
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-card shadow-sm text-[11px] font-bold uppercase tracking-widest text-muted-foreground active:scale-95 transition-transform">
        <Star className="w-3.5 h-3.5 text-[#F5B21B] fill-[#F5B21B]" />
        <span className="tabular-nums text-foreground">{balance}</span>
      </button>
      <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground={false}>
        <DrawerContent className="bg-card border-0 px-4 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
          <div className="max-w-md mx-auto w-full pt-3">
            <div className="flex items-center justify-between mb-4">
              <DrawerTitle className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">Power-ups</DrawerTitle>
              <div className="flex items-center gap-1 text-sm font-extrabold tabular-nums">
                {balance} <Star className="w-3.5 h-3.5 text-[#F5B21B] fill-[#F5B21B]" />
              </div>
            </div>
            <DrawerDescription className="sr-only">Spend stars on help for this level</DrawerDescription>
            <div className="space-y-2">
              {items.filter((i) => !i.hidden).map((i) => (
                <PowerUpRow key={i.key} {...i} disabled={i.disabled || balance < i.cost}
                  onBuy={() => { i.onBuy(); setOpen(false); }} />
              ))}
            </div>
            <div className="text-[11px] font-semibold text-muted-foreground mt-3 text-center">
              Earn stars by beating your best on campaign levels.
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export const POWER_UP_ICONS = { hint: Lightbulb, moves: Plus, reveal: Eye };