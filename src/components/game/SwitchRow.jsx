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
      className={`w-full flex items-center gap-3 min-h-[56px] px-4 py-2 rounded border text-left transition-colors ${
        highlight ? 'border-[#00E5C8]/70 bg-[#00E5C8]/5' : flash ? 'border-[#00E5C8]/50' : 'border-[#1a1e26]'
      } ${denied ? 'animate-shake' : ''} bg-[#0E1116] active:bg-[#12161d]`}
    >
      <span className="w-6 text-base font-bold tracking-wider">{button.id}</span>
      <span className="flex-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-[#6B7280]">
        {locked ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Icon className={`w-3.5 h-3.5 ${!available ? 'text-amber-500/70' : ''}`} />}
        {locked ? 'locked' : describeRule(button.rule)}
      </span>
      <Toggle on={on} locked={locked} dim={!available && !locked} colorblind={colorblind} reducedMotion={reducedMotion} />
    </button>
  );
}