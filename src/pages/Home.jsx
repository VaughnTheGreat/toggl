import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Infinity, GraduationCap, ChevronRight } from 'lucide-react';
import BottomNav from '@/components/game/BottomNav';
import Screen from '@/components/game/Screen';
import ModeTile from '@/components/game/ModeTile';
import { LEVELS } from '@/lib/game/levels';
import { validateAllLevels } from '@/lib/game/solver';
import { getStars, getUnlocked, getEndlessLevel } from '@/lib/game/storage';
import DifficultyPicker from '@/components/game/DifficultyPicker';
import DailyCard from '@/components/game/DailyCard';

export default function Home() {
  useEffect(() => { validateAllLevels(LEVELS); }, []);
  const totalStars = Object.values(getStars()).reduce((a, b) => a + b, 0);
  const current = Math.min(getUnlocked(), LEVELS.length);
  const level = LEVELS.find((l) => l.id === current);

  return (
    <Screen className="pb-28">
      <div className="flex items-center justify-end gap-2 mb-6">
        <div className="flex items-center gap-1.5 bg-card rounded-full shadow-sm px-4 py-2">
          <Star className="w-4 h-4 text-[#F5B21B] fill-[#F5B21B]" />
          <span className="text-sm font-extrabold">{totalStars}</span>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          Togg<span className="text-[#00A38C]">l</span>
        </h1>
        <p className="text-sm font-semibold text-muted-foreground">Observe. Predict. Commit.</p>
      </div>

      <Link
        to={`/play?level=${current}`}
        className="block rounded-3xl bg-gradient-to-b from-[#00CDAF] to-[#00A88F] text-white p-5 mb-4 shadow-[0_6px_18px_rgba(0,194,168,0.45)] active:scale-[0.98] transition-transform"
      >
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/70">Campaign</div>
        <div className="text-xl font-extrabold mt-1">Level {current} · {level?.name}</div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs font-semibold text-white/80">{level?.tier} tier</span>
          <span className="flex items-center gap-1 text-sm font-extrabold uppercase tracking-widest">Play <ChevronRight className="w-4 h-4" /></span>
        </div>
      </Link>

      <DailyCard />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <ModeTile
          to={`/play?endless=${getEndlessLevel()}`}
          icon={Infinity} iconClass="text-violet-500" bgClass="bg-violet-100 dark:bg-violet-500/15"
          title={`Endless ${String(getEndlessLevel()).padStart(3, '0')}`}
          subtitle="Generated puzzles"
        />
        <ModeTile
          to="/tutorial"
          icon={GraduationCap} iconClass="text-amber-500" bgClass="bg-amber-100 dark:bg-amber-500/15"
          title="Tutorial"
          subtitle="The six principles"
        />
      </div>

      <DifficultyPicker />

      <BottomNav active="home" />
    </Screen>
  );
}