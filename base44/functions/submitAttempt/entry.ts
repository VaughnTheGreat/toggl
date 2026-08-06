import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const RANK_THRESHOLDS = [
  { min: 40000, rank: 'grandmaster' },
  { min: 20000, rank: 'master' },
  { min: 10000, rank: 'architect' },
  { min: 5000, rank: 'tactician' },
  { min: 2000, rank: 'apprentice' },
  { min: 0, rank: 'novice' },
];

function rankForRating(rating) {
  for (const t of RANK_THRESHOLDS) {
    if (rating >= t.min) return t.rank;
  }
  return 'novice';
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  return Math.round((new Date(b) - new Date(a)) / 86400000);
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { levelId, timeTakenSeconds, movesUsed, optimalMoves, completed, perfect, switchesToggled } = body;
    const today = todayKey();

    await base44.entities.Attempt.create({
      level_id: levelId,
      time_taken_seconds: timeTakenSeconds,
      moves_used: movesUsed,
      optimal_moves: optimalMoves,
      completed: !!completed,
      perfect: !!perfect,
      switches_toggled: switchesToggled,
      date: today,
    });

    const existing = await base44.entities.UserProgress.filter({ created_by_id: user.id });
    let progress = existing[0];
    if (!progress) {
      progress = await base44.entities.UserProgress.create({});
    }

    let rating = progress.rating ?? 1000;
    const total_attempts = (progress.total_attempts || 0) + 1;
    let total_solves = progress.total_solves || 0;
    let current_perfect_streak = progress.current_perfect_streak || 0;
    let longest_perfect_streak = progress.longest_perfect_streak || 0;
    let daily_streak = progress.daily_streak || 0;
    let longest_daily_streak = progress.longest_daily_streak || 0;
    let highest_level_unlocked = progress.highest_level_unlocked || 1;

    if (completed) {
      total_solves += 1;
      current_perfect_streak = perfect ? current_perfect_streak + 1 : 0;
      if (current_perfect_streak > longest_perfect_streak) longest_perfect_streak = current_perfect_streak;

      let ratingGain = 700;
      if (perfect) ratingGain += 200;
      const targetTime = (optimalMoves || 0) * 5;
      if (timeTakenSeconds != null && timeTakenSeconds < targetTime) ratingGain += 100;
      rating += ratingGain;

      if (levelId === highest_level_unlocked) highest_level_unlocked += 1;
    } else {
      current_perfect_streak = 0;
      rating = Math.max(0, rating - 200);
    }

    const lastPlayDate = progress.last_play_date;
    if (!lastPlayDate) {
      daily_streak = 1;
    } else if (lastPlayDate !== today) {
      const gap = daysBetween(lastPlayDate, today);
      daily_streak = gap === 1 ? daily_streak + 1 : 1;
    }
    if (daily_streak > longest_daily_streak) longest_daily_streak = daily_streak;

    const rank = rankForRating(rating);
    const rating_history = [...(progress.rating_history || []), { date: today, rating, rank }];

    const recentAttempts = await base44.entities.Attempt.filter({ created_by_id: user.id }, '-created_date', 10);
    const consistency_score = recentAttempts.length
      ? Math.round((recentAttempts.filter((a) => a.completed).length / recentAttempts.length) * 100)
      : 0;

    const updated = await base44.entities.UserProgress.update(progress.id, {
      rating,
      rank,
      total_attempts,
      total_solves,
      current_perfect_streak,
      longest_perfect_streak,
      daily_streak,
      longest_daily_streak,
      last_play_date: today,
      consistency_score,
      highest_level_unlocked,
      rating_history,
    });

    return Response.json(updated);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}