import React, { useState } from 'react';
import usePullToRefresh from '@/hooks/usePullToRefresh';
import PullIndicator from '@/components/PullIndicator';
import { getProgress } from '@/lib/game/backendSync';
import { setUnlockedAtLeast, mergeStarsFromBest } from '@/lib/game/storage';
import { LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import Screen from '@/components/game/Screen';
import BottomNav from '@/components/game/BottomNav';
import StreakCard from '@/components/profile/StreakCard';
import RankProgress from '@/components/profile/RankProgress';
import StatTiles from '@/components/profile/StatTiles';
import BackendProgressCard from '@/components/profile/BackendProgressCard';
import AppearanceToggle from '@/components/profile/AppearanceToggle';
import SettingsRows from '@/components/profile/SettingsRows';
import AccountConnection from '@/components/profile/AccountConnection';
import DeleteMyData from '@/components/profile/DeleteMyData';
import { getStars } from '@/lib/game/storage';

export default function Profile() {
  const { isAuthenticated } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const totalStars = Object.values(getStars()).reduce((a, b) => a + b, 0);

  // Pull down: re-sync progress, then remount the cards so they refetch.
  const ptr = usePullToRefresh(() =>
    getProgress()
      .then((data) => {
        if (data?.progress?.highest_level_unlocked) setUnlockedAtLeast(data.progress.highest_level_unlocked);
        if (data?.progress?.level_best) mergeStarsFromBest(data.progress.level_best);
      })
      .catch(() => {})
      .finally(() => setRefreshKey((k) => k + 1))
  );

  return (
    <div ref={ptr.ref}>
    <PullIndicator pull={ptr.pull} refreshing={ptr.refreshing} ready={ptr.ready} />
    <Screen className="pb-28">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold">Profile</h1>
        {isAuthenticated && (
          <button
            onClick={() => base44.auth.logout()}
            className="flex items-center gap-1.5 bg-card rounded-full shadow-sm px-4 py-2 text-sm font-bold text-muted-foreground active:scale-95 transition-transform"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        )}
      </div>

      <div key={refreshKey}>
        <StreakCard />
        <RankProgress totalStars={totalStars} />
        <StatTiles />
        <BackendProgressCard />
        <AppearanceToggle />
        <AccountConnection />
        <SettingsRows />
        <DeleteMyData />
      </div>

      <BottomNav active="profile" />
    </Screen>
    </div>
  );
}