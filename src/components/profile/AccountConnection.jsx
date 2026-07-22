import React, { useEffect, useState } from 'react';
import { Apple } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import DeleteAccount from '@/components/profile/DeleteAccount';

export default function AccountConnection() {
  const [email, setEmail] = useState(null);

  useEffect(() => {
    base44.auth.me().then((u) => setEmail(u?.email || null)).catch(() => {});
  }, []);

  return (
    <div className="flex flex-col gap-2.5 mb-2.5">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Account</div>
      <div className="rounded-2xl bg-card shadow-sm px-4 py-3">
        <div className="text-sm font-bold">Signed in</div>
        <div className="text-[11px] font-semibold text-muted-foreground">{email || '—'}</div>
      </div>
      <button
        onClick={() => base44.auth.loginWithProvider('apple', '/profile')}
        className="w-full flex items-center gap-3 min-h-[60px] px-4 py-2.5 rounded-2xl bg-card shadow-sm text-left active:scale-[0.98] transition-transform"
      >
        <span className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center shrink-0">
          <Apple className="w-5 h-5" />
        </span>
        <span className="flex-1">
          <span className="block text-sm font-bold">Connect Apple account</span>
          <span className="block text-[11px] font-semibold text-muted-foreground">sign in with Apple on this account</span>
        </span>
      </button>
      <DeleteAccount />
    </div>
  );
}