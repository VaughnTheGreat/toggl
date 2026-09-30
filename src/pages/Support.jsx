import React from 'react';
import { Link } from 'react-router-dom';
import Screen from '@/components/game/Screen';

const FAQ = [
  { q: 'How do I play?', a: 'Each switch follows a rule. Press switches to make the system match the target pattern shown above the board, within the move limit. Tap the rule guide at the top of a level to see what each switch does.' },
  { q: 'I am stuck on a level.', a: 'Use Reset to start over, or open the power-ups menu for a hint. Hints cost stars and cap the stars you can earn on that level.' },
  { q: 'How do I earn stars?', a: 'Stars come from completing levels, daily challenges, badges, and rank-ups. Spend them in the Store on switch skins or on power-ups during play.' },
  { q: 'Where is my progress saved?', a: 'Progress is always saved on your device, and Toggl works fully offline. In the iOS app you can optionally sign in with Apple (Profile → Account & Sync) to back up your progress and sync it across your devices. Without an account, progress cannot be restored if you delete the app.' },
  { q: 'How does sync work?', a: 'When you’re signed in, Toggl syncs in the background whenever you have a connection. Progress from all your devices is combined, so you never lose levels or stars. You can also tap Sync now in Profile → Account & Sync.' },
  { q: 'How do I reset my progress?', a: 'Go to Profile and choose Reset progress. If you’re signed in, this also resets your cloud backup and every device signed in to your account. This cannot be undone.' },
  { q: 'How do invites work?', a: 'In the iOS app, go to Profile → Invite Friends and tap Share Invite. When a friend installs Toggl, enters your code (or opens your link), and signs in with Apple for the first time, you get 150 ★ and they get a 50 ★ welcome bonus. You can earn rewards for up to 3 friends (450 ★). Sharing alone does not earn stars, and invite codes only work when creating a new account.' },
  { q: 'How do I delete my account?', a: 'Go to Profile → Account & Sync → Delete account. This permanently deletes your account and cloud backup and disconnects Sign in with Apple. Progress on your device stays.' },
];

export default function Support() {
  return (
    <Screen className="pb-12">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/" className="text-sm font-bold text-muted-foreground">← Back</Link>
      </div>
      <h1 className="text-2xl font-extrabold mb-4">Support</h1>
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <p>Need help with Toggl? Find answers to common questions below.</p>
        {FAQ.map(({ q, a }) => (
          <div key={q}>
            <h2 className="text-base font-extrabold text-foreground pt-2">{q}</h2>
            <p>{a}</p>
          </div>
        ))}
        <h2 className="text-base font-extrabold text-foreground pt-2">Contact</h2>
        <p>Need more help? Contact us at <a href="mailto:humartventures@gmail.com" className="font-bold text-primary">humartventures@gmail.com</a>.</p>
        <h2 className="text-base font-extrabold text-foreground pt-2">Privacy</h2>
        <p>Read our <Link to="/privacy" className="font-bold text-primary">Privacy Policy</Link>.</p>
      </div>
    </Screen>
  );
}