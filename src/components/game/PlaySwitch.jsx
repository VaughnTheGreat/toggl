import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSettings } from '@/lib/game/storage';
import { playClick, vibrate } from '@/lib/game/feedback';
import { getEquippedSkin } from '@/lib/game/skins';
import Knob from '@/components/game/Knob';

export default function PlaySwitch({ to }) {
  const navigate = useNavigate();
  const [on, setOn] = useState(false);
  const settings = getSettings();
  const { color, knob, track } = getEquippedSkin();

  const flip = () => {
    if (on) return;
    setOn(true);
    playClick(settings.sound);
    vibrate(settings.haptics, 15);
    setTimeout(() => navigate(to), 320);
  };

  return (
    <button onClick={flip} aria-label="Play" className="mx-auto flex flex-col items-center gap-3 group">
      <span className={`relative block w-32 h-16 transition-colors duration-300 ${on ? '' : 'bg-muted-foreground/25'}`}
        style={{ borderRadius: track.radius === '9999px' ? track.radius : `calc(${track.radius} * 2)`, ...(on ? { background: color.bg, boxShadow: `0 8px 24px ${color.glow}73` } : {}) }}>
        <Knob knob={knob} className={`absolute top-1.5 left-1.5 w-[3.25rem] h-[3.25rem] transition-transform duration-300 ${
          on ? 'translate-x-16' : ''
        }`} />
      </span>
      <span className={`text-lg font-extrabold tracking-wide transition-colors ${on ? 'text-[#00A38C]' : 'text-foreground'}`}>
        Play
      </span>
    </button>
  );
}