import React, { useEffect, useState } from 'react';
import PlaySwitch from '@/components/game/PlaySwitch';
import BottomNav from '@/components/game/BottomNav';
import Screen from '@/components/game/Screen';
import { LEVELS } from '@/lib/game/levels';
import { validateAllLevels } from '@/lib/game/solver';
import { getPathLevel } from '@/lib/game/levelPath';
import { getUnlocked, setUnlockedAtLeast, isTutorialDone, mergeStarsFromBest } from '@/lib/game/storage';
import { getProgress } from '@/lib/game/backendSync';

export default function Home() {
  const [, setSynced] = useState(0);

  useEffect(() => { validateAllLevels(LEVELS); }, []);

  // Sync local level state from the backend on mount — so progress made on
  // another device (or before the local save was cleared) is restored.
  useEffect(() => {
    getProgress()
      .then((data) => {
        if (data?.progress?.highest_level_unlocked) {
          setUnlockedAtLeast(data.progress.highest_level_unlocked);
        }
        if (data?.progress?.level_best) mergeStarsFromBest(data.progress.level_best);
      })
      .catch(() => {})
      .finally(() => setSynced((n) => n + 1)); // re-render with any restored progress
  }, []);

  const current = getUnlocked();
  const level = getPathLevel(current);

  return (
    <Screen className="min-h-screen flex flex-col pb-24">
      <div className="flex-[1.2]" />

      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Togg<span className="text-[#00A38C]">l</span>
        </h1>
        <div className="text-2xl font-extrabold text-[#00A38C] mt-3">Level {current}</div>
      </div>

      <div className="flex-1" />

      <PlaySwitch to={isTutorialDone() ? `/play?level=${current}` : '/tutorial'} />

      <BottomNav active="home" />
    </Screen>
  );
}