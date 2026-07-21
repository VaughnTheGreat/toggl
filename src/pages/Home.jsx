import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Infinity, GraduationCap, ChevronRight, LayoutGrid, Settings as SettingsIcon, Home as HomeIcon } from 'lucide-react';
import Screen from '@/components/game/Screen';
import { LEVELS } from '@/lib/game/levels';
import { validateAllLevels } from '@/lib/game/solver';
import { getStars, getUnlocked, getEndlessLevel } from '@/lib/game/storage';

export default function Home() {
  useEffect(() => { validateAllLevels(LEVELS); }, []);
  const totalStars = Object.values(getStars()).reduce((a, b) => a + b, 0);
  const current = Math.min(getUnlocked(), LEVELS.length);
  const level = LEVELS.find((l) => l.id === current);

  return (
    <Screen className="pb-28">
      <div className="flex items-center justify-end gap-2 mb-6">
        <div className="flex items-center gap-1.5 bg-white rounded-full shadow-sm px-4 py-2">
          <Star className="w-4 h-4 text-[#F5B21B] fill-[#F5B21B]" />
          <span className="text-sm font-extrabold">{totalStars}</span>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">
          Logic<span className="text-[#00A38C]">Grid</span>
        </h1>
        <p className="text-sm font-semibold text-[#8A91A5]">Observe. Predict. Commit.</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-5 mb-4 text-sm font-medium italic text-[#8A91A5] leading-relaxed">
        Every switch is part of a system. Flipping one may flip others, unlock conditions, or seal options forever. Change the state — reach the target.
      </div>

      <Link to={`/play?level=${current}`} className="flex items-center gap-4 bg-white rounded-3xl shadow-sm p-4 mb-4 active:scale-[0.98] transition-transform">
        <div className="w-12 h-12 rounded-2xl bg-[#00C2A8]/10 flex items-center justify-center">
          <LayoutGrid className="w-6 h-6 text-[#00A38C]" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A91A5]">Campaign</div>
          <div className="text-base font-extrabold">Level {current} · {level?.name}</div>
          <div className="text-xs font-semibold text-[#8A91A5]">{level?.tier} tier</div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#B4BACA]" />
      </Link>

      <Link to={`/play?endless=${getEndlessLevel()}`} className="flex items-center gap-4 bg-white rounded-3xl shadow-sm p-4 mb-4 active:scale-[0.98] transition-transform">
        <div className="w-12 h-12 rounded-2xl bg-violet-100 flex items-center justify-center">
          <Infinity className="w-6 h-6 text-violet-500" />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8A91A5]">Endless</div>
          <div className="text-base font-extrabold">Sequence {String(getEndlessLevel()).padStart(3, '0')}</div>
          <div className="text-xs font-semibold text-[#8A91A5]">Unlimited generated puzzles</div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#B4BACA]" />
      </Link>

      <Link to="/tutorial" className="flex items-center gap-4 bg-white rounded-3xl shadow-sm p-4 mb-8 active:scale-[0.98] transition-transform">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-amber-500" />
        </div>
        <div className="flex-1">
          <div className="text-base font-extrabold">Tutorial</div>
          <div className="text-xs font-semibold text-[#8A91A5]">Learn the six principles</div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#B4BACA]" />
      </Link>

      <Link
        to={`/play?level=${current}`}
        className="block w-full py-4 rounded-full bg-gradient-to-b from-[#00CDAF] to-[#00A88F] text-white text-center font-extrabold text-lg tracking-wide shadow-[0_6px_18px_rgba(0,194,168,0.45)] active:scale-[0.98] transition-transform"
      >
        Play
      </Link>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#ECEFF5]">
        <div className="max-w-md mx-auto flex items-center justify-around py-2.5 pb-4">
          <span className="flex flex-col items-center gap-0.5 text-[#00A38C]">
            <HomeIcon className="w-5 h-5" /><span className="text-[10px] font-bold">Home</span>
          </span>
          <Link to="/levels" className="flex flex-col items-center gap-0.5 text-[#8A91A5]">
            <LayoutGrid className="w-5 h-5" /><span className="text-[10px] font-bold">Levels</span>
          </Link>
          <Link to="/settings" className="flex flex-col items-center gap-0.5 text-[#8A91A5]">
            <SettingsIcon className="w-5 h-5" /><span className="text-[10px] font-bold">Settings</span>
          </Link>
        </div>
      </nav>
    </Screen>
  );
}