import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

// Deletes the CALLER'S OWN Attempt and UserProgress records. Identity comes
// from the caller's own authenticated context; service role is used purely
// to perform the deletion since deleteMany requires elevated access.
export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    await base44.asServiceRole.entities.Attempt.deleteMany({ created_by_id: user.id });
    await base44.asServiceRole.entities.UserProgress.deleteMany({ created_by_id: user.id });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}