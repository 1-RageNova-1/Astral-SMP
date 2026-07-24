'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function GlassCard({ children, className, hover = true, glow, delay = 0, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={cn(
        'glass rounded-xl p-6 transition-all duration-300',
        glow === 'purple' && 'hover:glow-purple',
        glow === 'cyan' && 'hover:glow-cyan',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}