import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import FlameIcon from '@/components/game/FlameIcon';
import StarAmount from '@/components/profile/StarAmount';
import { getDaily, isDailyDone, dailyBonus, todayKey } from '@/lib/game/storage';

export default function DailyCard() {
  const done = isDailyDone();
  const { streak, lastDate } = getDaily();
  const alive = lastDate && Math.round((new Date(todayKey()) - new Date(lastDate)) / 86400000) === 1;
  const nextStreak = alive ? streak + 1 : 1;
  const Wrap = done ? 'div' : Link;

  return (
    <Wrap {...(done ? {} : { to: '/play?daily=1' })}
      className={`flex items-center gap-4 bg-card rounded-3xl shadow-sm p-4 ${done ? 'opacity-70' : 'active:scale-[0.98] transition-transform'}`}>
      <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-500/15 flex items-center justify-center">
        <FlameIcon className="w-6 h-6" />
      </div>
      <div className="flex-1 text-left">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Daily Challenge</div>
        <div className="text-base font-extrabold">
          {done ? 'Done · new puzzle tomorrow' : 'One shot at today\u2019s puzzle'}
        </div>
        <div className="text-xs font-semibold text-muted-foreground">
          {streak > 0 ? `${streak}-day streak` : 'Start your streak'}
          {!done && <> · up to <StarAmount value={dailyBonus(nextStreak)} plus /></>}
        </div>
      </div>
      {done ? (
        <CheckCircle2 className="w-5 h-5 text-[#00A38C]" />
      ) : (
        <ChevronRight className="w-5 h-5 text-[#B4BACA]" />
      )}
    </Wrap>
  );
}