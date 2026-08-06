import React, { useState } from 'react';
import { deleteMyData } from '@/lib/game/backendSync';
import { resetSave } from '@/lib/game/storage';
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';

export default function DeleteMyData() {
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    setBusy(true);
    try {
      await deleteMyData();
    } catch (e) {
      // best-effort — still reset local state so the UI reflects a clean slate
    }
    resetSave();
    window.location.href = '/';
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="w-full text-center py-3 text-[11px] font-semibold text-muted-foreground/70 hover:text-destructive/70 transition-colors">
          Delete my data
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-3xl max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your game data?</AlertDialogTitle>
          <AlertDialogDescription>
            This permanently removes your rating, streaks, and attempt history from the server, and resets your local progress to level 1. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {busy ? 'Deleting…' : 'Delete data'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}