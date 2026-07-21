import React from 'react';
import { Flame } from 'lucide-react';
import { getDaily, isDailyDone } from '@/lib/game/storage';

export default function StreakCard() {
  const { streak, best } = getDaily();
  const done = isDailyDone();
  const message = done
    ? 'Locked in for today. See you tomorrow.'
    : streak > 0
    ? 'Play today\u2019s daily to keep it going.'
    : 'Solve a Daily Challenge to start a streak.';

  return (
    <div className="flex items-center gap-4 bg-card rounded-3xl shadow-sm p-5 mb-4 border-2 border-[#00C2A8]/20">
      <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-500/15 flex items-center justify-center shrink-0">
        <Flame className="w-7 h-7 text-orange-500" />
      </div>
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Daily Streak</div>
        <div className="text-3xl font-extrabold leading-tight">
          {streak} <span className="text-sm text-[#00A38C]">day{streak === 1 ? '' : 's'}</span>
        </div>
        <div className="text-xs font-semibold text-muted-foreground">{message} Best: {best || 0} days</div>
      </div>
    </div>
  );
}