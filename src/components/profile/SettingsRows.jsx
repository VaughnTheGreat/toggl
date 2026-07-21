import React, { useState } from 'react';
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

export default function SettingsRows() {
  const [settings, setSettings] = useState(getSettings());

  const toggle = (key) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    saveSettings(next);
    playClick(next.sound);
    vibrate(next.haptics);
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground px-1">Settings</div>
      {ROWS.map((row) => (
        <button
          key={row.key}
          onClick={() => toggle(row.key)}
          aria-label={`${row.label}, ${settings[row.key] ? 'on' : 'off'}`}
          className="w-full flex items-center gap-3 min-h-[60px] px-4 py-2.5 rounded-2xl bg-card shadow-sm text-left active:scale-[0.98] transition-transform"
        >
          <span className="flex-1">
            <span className="block text-sm font-bold">{row.label}</span>
            <span className="block text-[11px] font-semibold text-muted-foreground">{row.desc}</span>
          </span>
          <Toggle on={settings[row.key]} colorblind={settings.colorblind} reducedMotion={settings.reducedMotion} />
        </button>
      ))}
    </div>
  );
}