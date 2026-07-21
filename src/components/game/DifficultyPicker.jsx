import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SlidersHorizontal } from 'lucide-react';
import { DIFFICULTIES } from '@/lib/game/generator';

export default function DifficultyPicker() {
  const navigate = useNavigate();
  const play = (tier) => navigate(`/play?custom=${tier}&seed=${Math.floor(Math.random() * 100000) + 1}`);

  return (
    <div className="bg-card rounded-3xl shadow-sm p-4 mb-4">
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-500/15 flex items-center justify-center">
          <SlidersHorizontal className="w-6 h-6 text-sky-500" />
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Custom Play</div>
          <div className="text-base font-extrabold">Choose your difficulty</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(DIFFICULTIES).map(([key, d]) => (
          <button
            key={key}
            onClick={() => play(key)}
            className="px-3 py-2.5 rounded-2xl bg-muted text-left active:scale-[0.97] transition-transform"
          >
            <div className="text-sm font-extrabold">{d.label}</div>
            <div className="text-[10px] font-semibold text-muted-foreground leading-tight">{d.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}