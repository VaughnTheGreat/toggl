import React from 'react';
import { Link } from 'react-router-dom';
import Screen from '@/components/game/Screen';

const FAQ = [
  { q: 'How do I play?', a: 'Each switch follows a rule. Press switches to make the system match the target pattern shown above the board, within the move limit. Tap the rule guide at the top of a level to see what each switch does.' },
  { q: 'I am stuck on a level.', a: 'Use Reset to start over, or open the power-ups menu for a hint. Hints cost stars and cap the stars you can earn on that level.' },
  { q: 'How do I earn stars?', a: 'Stars come from completing levels, daily challenges, badges, and rank-ups. Spend them in the Store on switch skins or on power-ups during play.' },
  { q: 'Where is my progress saved?', a: 'All progress is stored only on your device. There are no accounts, so progress cannot be restored if you delete the app or reset it.' },
  { q: 'How do I reset my progress?', a: 'Go to Profile and choose Reset progress. This cannot be undone.' },
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
        <h2 className="text-base font-extrabold text-foreground pt-2">Privacy</h2>
        <p>Read our <Link to="/privacy" className="font-bold text-primary">Privacy Policy</Link>.</p>
      </div>
    </Screen>
  );
}