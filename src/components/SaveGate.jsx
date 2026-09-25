import React, { useEffect, useState } from 'react';
import { initCloudSync } from '@/lib/game/cloudSync';
import { flushPendingAttempt } from '@/lib/game/backendSync';
import { getSettings } from '@/lib/game/storage';
import { applyTheme } from '@/lib/game/theme';

// Blocks rendering until the cloud save has been pulled and merged,
// so the player never sees stale progress on a fresh device.
export default function SaveGate({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initCloudSync().finally(() => {
      flushPendingAttempt();
      applyTheme(getSettings().theme);
      setReady(true);
    });
  }, []);

  if (!ready) {
    return <div className="fixed inset-0 bg-background" />;
  }
  return children;
}