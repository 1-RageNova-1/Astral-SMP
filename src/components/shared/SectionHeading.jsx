'use client';

import { motion } from 'framer-motion';

export default function SectionHeading({ title, subtitle, center = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`mb-10 ${center ? 'text-center' : ''}`}
    >
      <h2 className="text-2xl sm:text-3xl font-bold font-heading text-foreground mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base">
          {subtitle}
        </p>
      )}
      <div className="mt-4 h-1 w-16 bg-gradient-to-r from-primary to-accent rounded-full mx-auto" />
    </motion.div>
  );
}