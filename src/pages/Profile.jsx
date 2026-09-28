import React, { useState } from 'react';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import Screen from '@/components/game/Screen';
import BottomNav from '@/components/game/BottomNav';
import StreakCard from '@/components/profile/StreakCard';
import DailyCard from '@/components/game/DailyCard';
import RankProgress from '@/components/profile/RankProgress';
import StatTiles from '@/components/profile/StatTiles';
import LevelHistory from '@/components/profile/LevelHistory';
import AppearanceToggle from '@/components/profile/AppearanceToggle';
import SettingsRows from '@/components/profile/SettingsRows';
import DeleteMyData from '@/components/profile/DeleteMyData';

export default function Profile() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Pull down: remount the cards so they re-read the local save.
  const ptr = usePullToRefresh(async () => setRefreshKey((k) => k + 1));

  return (
    <div ref={ptr.ref}>
    <Screen className="pb-28">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold">Profile</h1>
      </div>

      <div key={refreshKey}>
        <StreakCard />
        <div className="mb-4"><DailyCard /></div>
        <RankProgress />
        <StatTiles />
        <LevelHistory />
        <AppearanceToggle />
        <SettingsRows />
        <DeleteMyData />
      </div>

      <BottomNav active="profile" />
    </Screen>
    </div>
  );
}