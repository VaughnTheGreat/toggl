import React, { useEffect, useState } from 'react';
import { resetSave } from '@/lib/game/storage';
import { cloudAvailable, loadCloud } from '@/lib/cloud';
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';

export default function DeleteMyData() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!cloudAvailable) return undefined;
    let off = () => {};
    let alive = true;
    loadCloud().then((c) => {
      if (!alive || !c) return;
      setSignedIn(c.getState().signedIn);
      off = c.onChange((s) => setSignedIn(s.signedIn));
    });
    return () => { alive = false; off(); };
  }, []);

  const handleDelete = async () => {
    resetSave();
    // Signed in: the reset must reach the cloud too, or the next sync would bring the progress back.
    // If this doesn't finish (offline, app closed), it's completed automatically on the next launch.
    if (signedIn) {
      const cloud = await loadCloud();
      await cloud?.resetEverywhere();
    }
    window.location.href = '/';
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="w-full text-center py-3 text-[11px] font-semibold text-muted-foreground/70 hover:text-destructive/70 transition-colors">
          Reset progress
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-3xl max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Reset your progress?</AlertDialogTitle>
          <AlertDialogDescription>
            {signedIn
              ? 'This erases all progress on this device and in your cloud backup, on every device signed in to your account, and starts you back at level 1. This cannot be undone.'
              : 'This erases all progress saved on this device and starts you back at level 1. This cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Reset
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
