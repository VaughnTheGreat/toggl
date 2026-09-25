import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigationType } from 'react-router-dom';

// Native-style screen transitions: PUSH slides in from the right,
// POP slides the old screen out to the right, REPLACE cross-fades.
const variants = {
  initial: (type) => (type === 'PUSH' ? { x: '100%', opacity: 1 } : type === 'POP' ? { x: '-30%', opacity: 0.6 } : { opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (type) => (type === 'PUSH' ? { x: '-30%', opacity: 0.6 } : type === 'POP' ? { x: '100%', opacity: 1 } : { opacity: 0 }),
};

export default function PageFade({ children }) {
  const { pathname } = useLocation();
  const navType = useNavigationType();
  return (
    <div className="overflow-x-hidden">
      <AnimatePresence mode="wait" initial={false} custom={navType}>
        <motion.div
          key={pathname}
          custom={navType}
          variants={variants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}