import React from 'react';
import { Link } from 'react-router-dom';
import Screen from '@/components/game/Screen';

export default function PrivacyPolicy() {
  return (
    <Screen className="pb-12">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="text-sm font-bold text-muted-foreground">← Back</Link>
      </div>
      <h1 className="text-2xl font-extrabold mb-4">Privacy Policy</h1>
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p><span className="font-bold text-foreground">Last updated:</span> September 2026</p>
        <p>
          Toggl ("we", "us") respects your privacy. You can play Toggl without an account and without giving us any personal information. Signing in is optional and only used to back up and sync your progress.
        </p>
        <h2 className="text-base font-extrabold text-foreground pt-2">Data Stored on Your Device</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><span className="font-semibold text-foreground">Game progress:</span> levels completed, stars earned, streaks, badges, and store items.</li>
          <li><span className="font-semibold text-foreground">Settings:</span> theme, sound, haptics, and other preferences.</li>
        </ul>
        <p>If you don't sign in, this data stays only on your device. We do not collect it or send it to our servers, and we cannot see it.</p>
        <h2 className="text-base font-extrabold text-foreground pt-2">Optional Account &amp; Sync (iOS app)</h2>
        <p>
          In the iOS app you can choose to sign in with Apple to back up your progress and sync it across your devices. If you do, we store:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><span className="font-semibold text-foreground">Your Apple account identifier</span> and the email address Apple shares with us. You can choose Hide My Email, in which case we only receive a private relay address.</li>
          <li><span className="font-semibold text-foreground">Your game progress and settings</span> (the same data listed above), and when they were last synced.</li>
          <li><span className="font-semibold text-foreground">A sign-in token from Apple,</span> used only to disconnect Sign in with Apple when you delete your account.</li>
        </ul>
        <p>
          This data is stored securely with our cloud provider, Supabase, and is used only to back up and sync your progress. We never receive your Apple password.
        </p>
        <h2 className="text-base font-extrabold text-foreground pt-2">Data We Don't Collect</h2>
        <p>We do not collect your name, contacts, location, or any other personal information, we do not track you, and we do not sell or share any data with third parties for advertising.</p>
        <h2 className="text-base font-extrabold text-foreground pt-2">Your Control</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><span className="font-semibold text-foreground">Reset progress:</span> Profile → Reset progress erases your progress on this device. If you're signed in, it also resets your cloud backup and every device signed in to your account.</li>
          <li><span className="font-semibold text-foreground">Sign out:</span> Profile → Account &amp; Sync → Sign out stops syncing. Your progress stays on the device.</li>
          <li><span className="font-semibold text-foreground">Delete your account:</span> Profile → Account &amp; Sync → Delete account permanently deletes your account and cloud backup and disconnects Sign in with Apple. Progress on your device stays.</li>
        </ul>
        <p>Deleting the app removes everything stored on your device. Without an account, erased progress cannot be restored.</p>
        <h2 className="text-base font-extrabold text-foreground pt-2">Children's Privacy</h2>
        <p>Toggl does not knowingly collect personal information from children. The optional account uses only what Apple provides when you choose to sign in.</p>
        <h2 className="text-base font-extrabold text-foreground pt-2">Contact</h2>
        <p>For privacy questions or requests, contact us at <a href="mailto:humartventures@gmail.com" className="font-bold text-primary">humartventures@gmail.com</a>.</p>
      </div>
    </Screen>
  );
}
