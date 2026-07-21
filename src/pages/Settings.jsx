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
        <Link to="/" aria-label="Back to menu" className="p-2 -ml-2"><ArrowLeft className="w-5 h-5" /></Link>
        <h1 className="text-lg font-bold uppercase tracking-widest">Settings</h1>
      </div>
      <div className="flex flex-col gap-2">
        {ROWS.map((row) => (
          <button
            key={row.key}
            onClick={() => toggle(row.key)}
            aria-label={`${row.label}, ${settings[row.key] ? 'on' : 'off'}`}
            className="w-full flex items-center gap-3 min-h-[56px] px-4 py-2 rounded border border-[#1a1e26] bg-[#0E1116] text-left active:bg-[#12161d]"
          >
            <span className="flex-1">
              <span className="block text-sm">{row.label}</span>
              <span className="block text-[11px] text-[#6B7280]">{row.desc}</span>
            </span>
            <Toggle on={settings[row.key]} colorblind={settings.colorblind} reducedMotion={settings.reducedMotion} />
          </button>
        ))}
      </div>
    </Screen>
  );
}