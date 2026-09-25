import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, RotateCcw } from 'lucide-react';
import CountdownRing from '@/components/game/CountdownRing';

const SECONDS = 6;

// Full-screen "Continue?" pop-up with a draining timer when the move limit is hit.
export default function OutOfMovesPanel({ cost, balance, canBuy, onBuy, onReset, onMenu }) {
  const offer = canBuy && balance >= cost;
  const [expired, setExpired] = useState(!offer);

  useEffect(() => {
    if (!offer) return;
    const t = setTimeout(() => setExpired(true), SECONDS * 1000);
    return () => clearTimeout(t);
  }, [offer]);

  const note = !canBuy ? 'This state can no longer reach the target.'
    : balance < cost ? `You need ${cost} stars to continue — you have ${balance}.`
    : expired ? 'Time’s up.' : 'Continue with 3 extra moves? Max 1 star.';

  return (
    <div className="fixed inset-0 z-50 bg-foreground/40 backdrop-blur-sm flex items-center justify-center px-6">
      <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 20 }}
        className="w-full max-w-xs bg-card rounded-3xl shadow-xl px-6 pt-6 pb-5 flex flex-col items-center text-center">
        <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">Out of moves</div>
        <div className="text-2xl font-extrabold mt-1">{offer && !expired ? 'Continue?' : 'Level failed'}</div>
        {offer && !expired && (
          <div className="my-5">
            <CountdownRing seconds={SECONDS}>
              <button onClick={onBuy} className="w-full h-full rounded-full bg-[#00A38C] text-white flex flex-col items-center justify-center active:scale-95 transition-transform">
                <span className="text-2xl font-extrabold leading-none">+3</span>
                <span className="flex items-center gap-1 text-xs font-extrabold mt-1 tabular-nums">{cost} <Star className="w-3 h-3 fill-current" /></span>
              </button>
            </CountdownRing>
          </div>
        )}
        <div className="text-xs font-semibold text-muted-foreground leading-relaxed mt-2">{note}</div>
        <button onClick={onReset} className={`w-full flex items-center justify-center gap-1.5 mt-5 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest active:scale-95 transition-transform ${offer && !expired ? 'bg-secondary text-muted-foreground' : 'bg-[#00A38C] text-white'}`}>
          <RotateCcw className="w-3.5 h-3.5" /> {offer && !expired ? 'No thanks' : 'Try again'}
        </button>
        <button onClick={onMenu} className="mt-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Menu</button>
      </motion.div>
    </div>
  );
}