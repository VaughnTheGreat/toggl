import React from 'react';
import { Star, Heart, Moon, Zap, Flower2, Crown } from 'lucide-react';

const ICONS = { heart: Heart, moon: Moon, bolt: Zap, flower: Flower2, crown: Crown };

// The sliding thumb of a switch, styled by the equipped knob skin.
export default function Knob({ knob, className = '' }) {
  const Icon = ICONS[knob.icon];
  if (Icon) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Icon className="w-full h-full drop-shadow" style={{ color: knob.iconColor, fill: knob.iconColor }} />
      </div>
    );
  }
  return (
    <div
      className={`flex items-center justify-center ${knob.clip ? '' : 'shadow-md'} ${className}`}
      style={{
        background: knob.bg,
        borderRadius: knob.radius,
        clipPath: knob.clip,
        boxShadow: knob.ring ? `inset 0 0 0 2px ${knob.ring}` : undefined,
      }}
    >
      {knob.star && <Star className="w-1/2 h-1/2 text-[#F5B21B] fill-[#F5B21B]" />}
    </div>
  );
}