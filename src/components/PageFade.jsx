import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

// Remounts on every route change so each page fades in like a native screen push.
export default function PageFade({ children }) {
  const { pathname } = useLocation();
  return (
    <motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.22, ease: 'easeOut' }}>
      {children}
    </motion.div>
  );
}