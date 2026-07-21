import React from 'react';
import { Power, ArrowRightLeft, Diamond, Lock, Copy } from 'lucide-react';
import Toggle from '@/components/game/Toggle';
import { describeRule } from '@/lib/game/ruleEngine';

const ICONS = { toggle: Power, linked: ArrowRightLeft, conditional: Diamond, lock: Lock, copy: Copy };

export default function SwitchRow({ button, on, locked, available = true, highlight, denied, flash, onPress, colorblind, reducedMotion, innerRef }) {
  const Icon = ICONS[button.rule.type] || Power;
  return (
    <button
      ref={innerRef}
      onClick={() => onPress?.(button)}
      aria-label={`Switch ${button.id}, ${on ? 'on' : 'off'}${locked ? ', locked' : ''}${!available && !locked ? ', unavailable' : ''}`}
      className={`w-full flex items-center gap-3 min-h-[60px] px-4 py-2.5 rounded-2xl text-left bg-white shadow-sm transition-all active:scale-[0.98] ${
        highlight ? 'ring-2 ring-[#00C2A8]' : flash ? 'ring-2 ring-[#00C2A8]/50' : ''
      } ${denied ? 'animate-shake' : ''}`}
    >
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center font-mono font-extrabold text-sm ${
        on ? 'bg-[#00C2A8]/10 text-[#00A38C]' : 'bg-[#F2F4F8] text-[#8A91A5]'
      }`}>{button.id}</span>
      <span className="flex-1 flex items-center gap-1.5 text-[11px] font-semibold text-[#8A91A5]">
        {locked ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Icon className={`w-3.5 h-3.5 ${!available ? 'text-amber-500' : 'text-[#B4BACA]'}`} />}
        {locked ? 'locked' : describeRule(button.rule)}
      </span>
      <Toggle on={on} locked={locked} dim={!available && !locked} colorblind={colorblind} reducedMotion={reducedMotion} />
    </button>
  );
}