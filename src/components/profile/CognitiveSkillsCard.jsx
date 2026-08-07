import React, { useEffect, useState } from 'react';
import { Brain, Zap, Shuffle, Repeat } from 'lucide-react';
import { loadUserProgress } from '@/lib/game/backendSync';

const SKILLS = [
  { key: 'planning', label: 'Planning', icon: Brain, color: 'text-[#00A38C]' },
  { key: 'efficiency', label: 'Efficiency', icon: Zap, color: 'text-[#F5B21B]' },
  { key: 'adaptability', label: 'Adaptability', icon: Shuffle, color: 'text-violet-500' },
  { key: 'persistence', label: 'Persistence', icon: Repeat, color: 'text-sky-500' },
];

export default function CognitiveSkillsCard() {
  const [skills, setSkills] = useState(null);

  useEffect(() => {
    loadUserProgress()
      .then((p) => setSkills(p?.cognitive_skills || null))
      .catch(() => setSkills(null));
  }, []);

  if (!skills) return null;

  return (
    <div className="bg-card rounded-3xl shadow-sm p-5 mb-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-3">Cognitive Skills</div>
      <div className="grid grid-cols-2 gap-3">
        {SKILLS.map((s) => {
          const val = skills[s.key] || 0;
          const Icon = s.icon;
          return (
            <div key={s.key} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                <span className="text-[11px] font-bold text-muted-foreground">{s.label}</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={`text-xl font-extrabold tabular-nums ${s.color}`}>{val}</span>
                <span className="text-[10px] font-semibold text-muted-foreground">/100</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={`h-full rounded-full ${s.color.replace('text-', 'bg-')}`} style={{ width: `${val}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}