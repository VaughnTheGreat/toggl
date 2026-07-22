import { createClientFromRequest } from "npm:@base44/sdk";

// Deletes the CALLER'S OWN account only. We read the identity from the
// caller's own authenticated context (never from the request body), then
// use the service role purely to perform the delete — a regular user client
// can't delete User records at all, self or otherwise.
Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  const me = await base44.auth.me().catch(() => null);
  if (!me?.id) {
    return Response.json({ error: "Not authenticated" }, { status: 401 });
  }

  await base44.asServiceRole.entities.User.delete(me.id);

  return Response.json({ success: true });
});
