import React, { useEffect, useState } from 'react';
import PlaySwitch from '@/components/game/PlaySwitch';
import BottomNav from '@/components/game/BottomNav';
import Screen from '@/components/game/Screen';
import { LEVELS } from '@/lib/game/levels';
import { validateAllLevels } from '@/lib/game/solver';
import { getPathLevel } from '@/lib/game/levelPath';
import { useNavigate } from 'react-router-dom';
import { getUnlocked, setUnlockedAtLeast, isTutorialDone, setTutorialDone, mergeStarsFromBest } from '@/lib/game/storage';
import { getProgress } from '@/lib/game/backendSync';
import usePullToRefresh from '@/hooks/usePullToRefresh';

export default function Home() {
  const navigate = useNavigate();
  const [, setSynced] = useState(0);

  useEffect(() => { validateAllLevels(LEVELS); }, []);

  // Sync local level state from the backend on mount — so progress made on
  // another device (or before the local save was cleared) is restored.
  const syncProgress = () =>
    getProgress()
      .then((data) => {
        if (data?.progress?.highest_level_unlocked) {
          setUnlockedAtLeast(data.progress.highest_level_unlocked);
        }
        if (data?.progress?.level_best) mergeStarsFromBest(data.progress.level_best);
      })
      .catch(() => {})
      .finally(() => setSynced((n) => n + 1)); // re-render with any restored progress

  // Brand-new players go straight into Level 1 (levels 1–5 are the tutorial).
  // Waits for the progress sync so returning players aren't sent back.
  useEffect(() => {
    syncProgress().then(() => {
      if (!isTutorialDone()) {
        setTutorialDone();
        navigate('/play?level=1');
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const ptr = usePullToRefresh(syncProgress);

  const current = getUnlocked();
  const level = getPathLevel(current);

  return (
    <div ref={ptr.ref} className="fixed inset-0 overflow-hidden touch-none">
    <Screen className="h-[calc(100dvh_-_env(safe-area-inset-top)_-_env(safe-area-inset-bottom))] flex flex-col pb-24">
      <div className="flex-[1.2]" />

      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Togg<span className="text-[#00A38C]">l</span>
        </h1>
        <div className="text-2xl font-extrabold text-[#00A38C] mt-3">Level {current}</div>
      </div>

      <div className="flex-1" />

      <PlaySwitch to={`/play?level=${current}`} />

      <BottomNav active="home" />
    </Screen>
    </div>
  );
}