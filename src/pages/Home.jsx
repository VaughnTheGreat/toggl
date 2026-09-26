import React, { useEffect, useState } from 'react';
import PlaySwitch from '@/components/game/PlaySwitch';
import BottomNav from '@/components/game/BottomNav';
import DailyCard from '@/components/game/DailyCard';
import Screen from '@/components/game/Screen';
import { LEVELS } from '@/lib/game/levels';
import { validateAllLevels } from '@/lib/game/solver';
import { getPathLevel } from '@/lib/game/levelPath';
import { useNavigate } from 'react-router-dom';
import { getUnlocked, isTutorialDone, setTutorialDone } from '@/lib/game/storage';
import usePullToRefresh from '@/hooks/usePullToRefresh';

export default function Home() {
  const navigate = useNavigate();
  const [, setRefreshed] = useState(0);

  useEffect(() => { validateAllLevels(LEVELS); }, []);

  // Brand-new players go straight into Level 1 (levels 1–5 are the tutorial).
  useEffect(() => {
    if (!isTutorialDone()) {
      setTutorialDone();
      navigate('/play?level=1');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const ptr = usePullToRefresh(async () => setRefreshed((n) => n + 1));

  const current = getUnlocked();
  const level = getPathLevel(current);

  return (
    <div ref={ptr.ref} className="fixed inset-0 overflow-hidden touch-none">
    <Screen className="h-[calc(100dvh_-_var(--safe-top)_-_var(--safe-bottom))] flex flex-col pb-24">
      <div className="flex-[1.2]" />

      <div className="text-center">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Togg<span className="text-[#00A38C]">l</span>
        </h1>
        <div className="text-2xl font-extrabold text-[#00A38C] mt-3">Level {current}</div>
      </div>

      <div className="flex-1" />

      <div className="mb-8"><DailyCard /></div>

      <PlaySwitch to={`/play?level=${current}`} />

      <BottomNav active="home" />
    </Screen>
    </div>
  );
}