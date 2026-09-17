'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SectionHeading from '@/components/shared/SectionHeading';
import { Users, ShoppingCart, Gamepad2, MessageSquare } from 'lucide-react';

function unwrap(payload) {
  if (!payload || typeof payload !== 'object') return null;
  if (payload.player_count !== undefined || payload.discord_members !== undefined) return payload;
  if (payload.data && typeof payload.data === 'object') return payload.data;
  return payload;
}

export default function StatsSection() {
  const [stats, setStats] = useState({
    playersOnline: 0,
    discordMembers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/public/status', { cache: 'no-store' });
        const json = await res.json();
        const status = unwrap(json) || {};
        setStats({
          playersOnline: status.player_count ?? 0,
          discordMembers: status.discord_members ?? 0,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 20000);
    return () => clearInterval(interval);
  }, []);

  const STATS = [
    {
      label: 'Players Online',
      value: loading ? '...' : Number(stats.playersOnline).toLocaleString(),
      icon: Gamepad2,
      color: 'text-yellow-400',
    },
    {
      label: 'Discord Members',
      value: loading ? '...' : Number(stats.discordMembers).toLocaleString(),
      icon: MessageSquare,
      color: 'text-blue-400',
    },
    {
      label: 'Registered Users',
      value: '100+',
      icon: Users,
      color: 'text-primary',
    },
    {
      label: 'Total Purchases',
      value: '3',
      icon: ShoppingCart,
      color: 'text-accent',
    },
  ];

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
                <p className={`text-2xl sm:text-3xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}