'use client';

import { motion } from 'framer-motion';
import SectionHeading from '@/components/shared/SectionHeading';
import { Users, ShoppingCart, Gamepad2, MessageSquare } from 'lucide-react';

const STATS = [
  { label: 'Registered Users', value: '12,450+', icon: Users, color: 'text-primary' },
  { label: 'Total Purchases', value: '8,320+', icon: ShoppingCart, color: 'text-accent' },
  { label: 'Players Joined', value: '45,000+', icon: Gamepad2, color: 'text-yellow-400' },
  { label: 'Discord Members', value: '5,200+', icon: MessageSquare, color: 'text-blue-400' },
];

export default function StatsSection() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <SectionHeading title="Our Community" subtitle="Growing stronger every day" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {STATS.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass rounded-xl p-6 text-center hover:border-primary/30 transition-all"
              >
                <Icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                <p className={`text-2xl sm:text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}