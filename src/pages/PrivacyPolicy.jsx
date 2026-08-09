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
        <p><span className="font-bold text-foreground">Last updated:</span> August 2026</p>
        <p>
          Toggl ("we", "us") respects your privacy. This policy explains what data we collect and how we use it.
        </p>
        <h2 className="text-base font-extrabold text-foreground pt-2">Data We Collect</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><span className="font-semibold text-foreground">Account info:</span> email address and display name, used for authentication.</li>
          <li><span className="font-semibold text-foreground">Game progress:</span> levels completed, stars earned, move counts, time taken, and cognitive skill scores per attempt.</li>
          <li><span className="font-semibold text-foreground">Usage stats:</span> daily streaks, ratings, and rank progression.</li>
        </ul>
        <h2 className="text-base font-extrabold text-foreground pt-2">How We Use Your Data</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>To sync your progress across devices.</li>
          <li>To calculate skill ratings, streaks, and rankings.</li>
          <li>To improve level difficulty and game balance.</li>
        </ul>
        <h2 className="text-base font-extrabold text-foreground pt-2">Data Storage</h2>
        <p>Your data is stored securely on our servers and is only accessible to you and authorized administrators.</p>
        <h2 className="text-base font-extrabold text-foreground pt-2">Your Rights</h2>
        <p>You can delete all your game data at any time from Profile → Delete My Data. You can also delete your entire account from Profile → Account settings.</p>
        <h2 className="text-base font-extrabold text-foreground pt-2">Third-Party Services</h2>
        <p>We use Google OAuth for optional sign-in. Google's privacy policy applies to data collected during that process.</p>
        <h2 className="text-base font-extrabold text-foreground pt-2">Contact</h2>
        <p>For privacy questions, contact Base44 support.</p>
      </div>
    </Screen>
  );
}