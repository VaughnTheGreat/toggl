import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DIFFICULTIES } from '@/lib/game/generator';

export default function DifficultyPicker() {
  const navigate = useNavigate();
  const play = (tier) => navigate(`/play?custom=${tier}&seed=${Math.floor(Math.random() * 100000) + 1}`);

  return (
    <div className="bg-card rounded-3xl shadow-sm p-4 mb-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2.5">Custom Play</div>
      <div className="flex gap-2">
        {Object.entries(DIFFICULTIES).map(([key, d]) => (
          <button
            key={key}
            onClick={() => play(key)}
            className="flex-1 py-2.5 rounded-2xl bg-muted text-xs font-extrabold active:scale-[0.97] transition-transform"
          >
            {d.label}
          </button>
        ))}
      </div>
    </div>
  );
}