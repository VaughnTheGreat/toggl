import React, { useEffect, useRef } from 'react';
import { Star, Check } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { RANKS } from '@/lib/game/ranks';

export default function RankLadderSheet({ open, onOpenChange, currentIndex }) {
  const currentRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => currentRef.current?.scrollIntoView({ block: 'center' }), 50);
    return () => clearTimeout(id);
  }, [open]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader>
          <DrawerTitle className="text-lg font-extrabold">All Ranks</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-[calc(1.5rem+env(safe-area-inset-bottom))] space-y-1.5">
          {RANKS.map((r, i) => {
            const reached = i < currentIndex;
            const current = i === currentIndex;
            return (
              <div
                key={r.title}
                ref={current ? currentRef : null}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 ${
                  current ? 'bg-[#00C2A8]/10 ring-1 ring-[#00A38C]' : 'bg-muted'
                } ${!reached && !current ? 'opacity-50' : ''}`}
              >
                <div className="w-6 flex justify-center">
                  {reached ? <Check className="w-4 h-4 text-[#00A38C]" /> : <span className="text-xs font-bold text-muted-foreground tabular-nums">{i + 1}</span>}
                </div>
                <div className="flex-1">
                  <div className={`text-sm font-extrabold ${current ? 'text-[#00A38C]' : ''}`}>{r.title}</div>
                  <div className="text-xs font-semibold text-muted-foreground">
                    {r.min === 0 ? 'Start' : `${r.min} levels`}
                  </div>
                </div>
                {i > 0 && (
                  <span className="flex items-center gap-1 text-xs font-extrabold text-foreground tabular-nums">
                    +{i * 25} <Star className="w-3.5 h-3.5 text-[#F5B21B] fill-[#F5B21B]" />
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </DrawerContent>
    </Drawer>
  );
}