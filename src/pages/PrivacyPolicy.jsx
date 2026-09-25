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
          Toggl ("we", "us") respects your privacy. Toggl has no accounts and no sign-in — you can play without giving us any personal information.
        </p>
        <h2 className="text-base font-extrabold text-foreground pt-2">Data Stored on Your Device</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><span className="font-semibold text-foreground">Game progress:</span> levels completed, stars earned, streaks, and badges.</li>
          <li><span className="font-semibold text-foreground">Settings:</span> theme, sound, haptics, and other preferences.</li>
        </ul>
        <p>This data is saved only on your device. We do not collect it or send it to our servers, and we cannot see it.</p>
        <h2 className="text-base font-extrabold text-foreground pt-2">Data We Don't Collect</h2>
        <p>We do not collect your name, email address, contacts, location, or any other personal information, and we do not sell or share any data with third parties.</p>
        <h2 className="text-base font-extrabold text-foreground pt-2">Your Control</h2>
        <p>You can erase your progress at any time from Profile → Reset progress. Deleting the app or clearing its data also removes everything stored on your device. Because nothing is backed up, erased progress cannot be restored.</p>
        <h2 className="text-base font-extrabold text-foreground pt-2">Children's Privacy</h2>
        <p>Toggl does not knowingly collect personal information from anyone, including children.</p>
        <h2 className="text-base font-extrabold text-foreground pt-2">Contact</h2>
        <p>For privacy questions, contact Base44 support.</p>
      </div>
    </Screen>
  );
}