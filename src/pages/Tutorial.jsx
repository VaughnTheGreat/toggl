import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Screen from '@/components/game/Screen';
import TargetPanel from '@/components/game/TargetPanel';
import SystemPanel from '@/components/game/SystemPanel';
import { TUTORIAL_STEPS } from '@/lib/game/tutorialSteps';
import { canPress, applyPress } from '@/lib/game/ruleEngine';
import { getSettings, setTutorialDone } from '@/lib/game/storage';
import { playClick, vibrate } from '@/lib/game/feedback';

export default function Tutorial() {
  const navigate = useNavigate();
  const settings = getSettings();
  const [stepIndex, setStepIndex] = useState(0);
  const step = TUTORIAL_STEPS[stepIndex];
  const [states, setStates] = useState({ ...step.start });
  const [locks, setLocks] = useState({});
  const [lastEffect, setLastEffect] = useState(null);
  const [deniedId, setDeniedId] = useState(null);

  const solved = step.buttons.every((b) => !!states[b.id] === !!step.target[b.id]);

  const handlePress = (button) => {
    if (solved) return;
    if (!canPress(states, locks, button)) {
      playClick(settings.sound, true);
      vibrate(settings.haptics, [25, 40, 25]);
      setDeniedId(button.id);
      setTimeout(() => setDeniedId(null), 300);
      return;
    }
    const res = applyPress(states, locks, button);
    playClick(settings.sound);
    vibrate(settings.haptics);
    setLastEffect({ source: button.id, targets: res.changed, ts: Date.now() });
    setStates(res.states);
    setLocks(res.locks);
  };

  const goTo = (i) => {
    if (i >= TUTORIAL_STEPS.length) {
      setTutorialDone();
      navigate('/play?level=1');
      return;
    }
    setStepIndex(i);
    setStates({ ...TUTORIAL_STEPS[i].start });
    setLocks({});
    setLastEffect(null);
  };

  return (
    <Screen>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} aria-label="Back to menu" className="p-2 -ml-2"><ArrowLeft className="w-5 h-5" /></button>
        <div className="flex-1">
          <div className="text-sm font-bold">{step.title}</div>
          <div className="text-[10px] uppercase tracking-widest text-[#6B7280]">Tutorial {stepIndex + 1} / {TUTORIAL_STEPS.length}</div>
        </div>
      </div>

      <p className="text-xs text-[#9aa3b2] leading-relaxed mb-5">{step.text}</p>
      <TargetPanel buttons={step.buttons} target={step.target} states={states} />
      <div className="border-t border-[#1E2128] my-5" />
      <SystemPanel buttons={step.buttons} states={states} locks={locks} onPress={handlePress} lastEffect={lastEffect} deniedId={deniedId} settings={settings} />

      <div className="mt-6">
        {solved ? (
          <div>
            <div className="px-3 py-3 rounded border border-[#00E5C8]/30 bg-[#00E5C8]/5 text-xs text-[#c9efe8] leading-relaxed mb-3">
              <span className="text-[#00E5C8] font-bold uppercase tracking-widest text-[10px] block mb-1">Principle</span>
              {step.principle}
            </div>
            <button onClick={() => goTo(stepIndex + 1)} className="w-full py-3 rounded bg-[#00E5C8] text-[#0A0C10] font-bold text-sm tracking-widest uppercase">
              {stepIndex + 1 >= TUTORIAL_STEPS.length ? 'Start Campaign' : 'Continue'}
            </button>
          </div>
        ) : (
          <button onClick={() => { setStates({ ...step.start }); setLocks({}); }} className="text-[11px] uppercase tracking-widest text-[#6B7280]">
            Reset step
          </button>
        )}
      </div>
    </Screen>
  );
}