import React from 'react';
import { Star } from 'lucide-react';

// The sliding thumb of a switch, styled by the equipped knob skin.
export default function Knob({ knob, className = '' }) {
  return (
    <div
      className={`flex items-center justify-center shadow-md ${className}`}
      style={{ background: knob.bg, borderRadius: knob.radius, boxShadow: knob.ring ? `inset 0 0 0 2px ${knob.ring}` : undefined }}
    >
      {knob.star && <Star className="w-1/2 h-1/2 text-[#F5B21B] fill-[#F5B21B]" />}
    </div>
  );
}