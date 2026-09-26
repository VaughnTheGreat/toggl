import React from 'react';
import { Star, Heart } from 'lucide-react';

// The sliding thumb of a switch, styled by the equipped knob skin.
export default function Knob({ knob, className = '' }) {
  if (knob.icon === 'heart') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Heart className="w-full h-full text-white fill-white drop-shadow" />
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