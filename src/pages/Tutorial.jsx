import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Screen from '@/components/game/Screen';
import TargetPanel from '@/components/game/TargetPanel';
import SystemPanel from '@/components/game/SystemPanel';
import { TUTORIAL_STEPS } from '@/lib/game/tutorialSteps';
import { canPress, applyPress } from '@/lib/game/ruleEngine';
import { getSettings, setTutorialDone, getUnlocked } from '@/lib/game/storage';
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
      navigate(`/play?level=${getUnlocked()}`);
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
        <button onClick={() => navigate('/')} aria-label="Back to menu" className="w-10 h-10 rounded-full bg-card shadow-sm flex items-center justify-center shrink-0">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="text-base font-extrabold">{step.title}</div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Tutorial {stepIndex + 1} / {TUTORIAL_STEPS.length}</div>
        </div>
      </div>

      <div className="bg-card rounded-2xl shadow-sm px-4 py-3.5 text-xs font-semibold text-[#5A6178] dark:text-[#B6BDD1] leading-relaxed mb-4">{step.text}</div>
      <TargetPanel buttons={step.buttons} target={step.target} states={states} />
      <div className="my-4" />
      <SystemPanel buttons={step.buttons} states={states} locks={locks} onPress={handlePress} lastEffect={lastEffect} deniedId={deniedId} settings={settings} />

      <div className="mt-6">
        {solved ? (
          <div>
            <div className="px-4 py-3.5 rounded-2xl bg-[#00C2A8]/10 text-xs font-semibold text-[#00806E] dark:text-[#2BD9BF] leading-relaxed mb-3">
              <span className="text-[#00A38C] font-extrabold uppercase tracking-[0.2em] text-[10px] block mb-1">Principle</span>
              {step.principle}
            </div>
            <button onClick={() => goTo(stepIndex + 1)} className="w-full py-4 rounded-full bg-gradient-to-b from-[#00CDAF] to-[#00A88F] text-white font-extrabold text-sm tracking-widest uppercase shadow-[0_4px_14px_rgba(0,194,168,0.4)] active:scale-[0.98] transition-transform">
              {stepIndex + 1 >= TUTORIAL_STEPS.length ? 'Start Campaign' : 'Continue'}
            </button>
          </div>
        ) : (
          <button onClick={() => { setStates({ ...step.start }); setLocks({}); }} className="px-4 py-2.5 rounded-full bg-card shadow-sm text-[11px] font-bold uppercase tracking-widest text-muted-foreground active:scale-95 transition-transform">
            Reset step
          </button>
        )}
      </div>
    </Screen>
  );
}