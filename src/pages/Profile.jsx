import React from 'react';
import { LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Screen from '@/components/game/Screen';
import BottomNav from '@/components/game/BottomNav';
import StreakCard from '@/components/profile/StreakCard';
import RankProgress from '@/components/profile/RankProgress';
import StatTiles from '@/components/profile/StatTiles';
import AppearanceToggle from '@/components/profile/AppearanceToggle';
import SettingsRows from '@/components/profile/SettingsRows';
import AccountConnection from '@/components/profile/AccountConnection';
import { getStars } from '@/lib/game/storage';

export default function Profile() {
  const totalStars = Object.values(getStars()).reduce((a, b) => a + b, 0);

  return (
    <Screen className="pb-28">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold">Profile</h1>
        <button
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-1.5 bg-card rounded-full shadow-sm px-4 py-2 text-sm font-bold text-muted-foreground active:scale-95 transition-transform"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>

      <StreakCard />
      <RankProgress totalStars={totalStars} />
      <StatTiles />
      <AppearanceToggle />
      <AccountConnection />
      <SettingsRows />

      <BottomNav active="profile" />
    </Screen>
  );
}