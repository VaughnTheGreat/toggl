import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Screen from '@/components/game/Screen';
import Toggle from '@/components/game/Toggle';
import { getSettings, saveSettings } from '@/lib/game/storage';
import { playClick, vibrate } from '@/lib/game/feedback';

const ROWS = [
  { key: 'sound', label: 'Sound', desc: 'mechanical click feedback' },
  { key: 'haptics', label: 'Haptics', desc: 'vibration on press' },
  { key: 'reducedMotion', label: 'Reduced motion', desc: 'instant state changes' },
  { key: 'colorblind', label: 'Colorblind mode', desc: 'pattern fill on ON state' },
  { key: 'zen', label: 'Zen mode', desc: 'relaxed play, no move limits shown' },
];

export default function Settings() {
  const [settings, setSettings] = useState(getSettings());

  const toggle = (key) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    saveSettings(next);
    playClick(next.sound);
    vibrate(next.haptics);
  };

  return (
    <Screen>
      <div className="flex items-center gap-3 mb-8">
        <Link to="/" aria-label="Back to menu" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-xl font-extrabold">Settings</h1>
      </div>
      <div className="flex flex-col gap-2.5">
        {ROWS.map((row) => (
          <button
            key={row.key}
            onClick={() => toggle(row.key)}
            aria-label={`${row.label}, ${settings[row.key] ? 'on' : 'off'}`}
            className="w-full flex items-center gap-3 min-h-[60px] px-4 py-2.5 rounded-2xl bg-white shadow-sm text-left active:scale-[0.98] transition-transform"
          >
            <span className="flex-1">
              <span className="block text-sm font-bold">{row.label}</span>
              <span className="block text-[11px] font-semibold text-[#8A91A5]">{row.desc}</span>
            </span>
            <Toggle on={settings[row.key]} colorblind={settings.colorblind} reducedMotion={settings.reducedMotion} />
          </button>
        ))}
      </div>
    </Screen>
  );
}