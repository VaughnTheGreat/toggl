import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Returns today's daily challenge configuration. The level is generated
// deterministically from the date so every player gets the same puzzle,
// but the server is the source of truth — ensuring cross-device consistency
// and enabling future server-side difficulty tuning without a client update.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const today = new Date().toISOString().slice(0, 10);
    const seed = parseInt(today.replace(/-/g, ''), 10);

    // Daily difficulty rotates through tiers across the week for variety.
    const dayOfWeek = new Date(today).getDay(); // 0=Sun … 6=Sat
    const tiers = ['beginner', 'skilled', 'skilled', 'advanced', 'advanced', 'expert', 'skilled'];
    const tier = tiers[dayOfWeek];

    const config = {
      date: today,
      seed,
      tier,
      buttonCount: 4 + (dayOfWeek % 4), // 4–7
      targetMoves: 4 + (dayOfWeek % 4), // 4–7
      undoAllowed: dayOfWeek < 5, // weekdays allow undo
    };

    return Response.json(config);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}