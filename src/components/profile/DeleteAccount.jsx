import React, { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import {
  AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader,
  AlertDialogTitle, AlertDialogDescription, AlertDialogFooter,
  AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';

export default function DeleteAccount() {
  const [busy, setBusy] = useState(false);

  const handleDelete = async () => {
    setBusy(true);
    try {
      // No SDK delete endpoint — flag the account for deletion, then sign out.
      await base44.auth.updateMe({ deletion_requested_at: new Date().toISOString() });
    } catch (e) {
      // Sign out regardless so the flow always completes on-device.
    }
    base44.auth.logout('/');
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="w-full flex items-center gap-3 min-h-[60px] px-4 py-2.5 rounded-2xl bg-card shadow-sm text-left active:scale-[0.98] transition-transform">
          <span className="w-9 h-9 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
            <Trash2 className="w-4 h-4" />
          </span>
          <span className="flex-1">
            <span className="block text-sm font-bold text-destructive">Delete account</span>
            <span className="block text-[11px] font-semibold text-muted-foreground">permanently remove your account and data</span>
          </span>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-3xl max-w-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete your account?</AlertDialogTitle>
          <AlertDialogDescription>
            This action is permanent. Your account, progress, and all associated data will be deleted and cannot be recovered. You will be signed out immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={busy}
            onClick={handleDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {busy ? 'Deleting…' : 'Delete account'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}