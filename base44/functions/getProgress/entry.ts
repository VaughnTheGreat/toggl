import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Single call on app start: returns the caller's UserProgress (if any) plus
// their last 20 attempts for timeline / analytics. Used by the Home screen
// to sync local level state and by the Profile screen for stats display.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const progressList = await base44.entities.UserProgress.filter({ created_by_id: user.id });
    const progress = progressList[0] || null;

    let recentAttempts = [];
    if (progress) {
      recentAttempts = await base44.entities.Attempt.filter({ created_by_id: user.id }, '-created_date', 20);
    }

    return Response.json({
      progress,
      recentAttempts,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}