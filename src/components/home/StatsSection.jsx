'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SectionHeading from '@/components/shared/SectionHeading';
import { Users, ShoppingCart, Gamepad2, MessageSquare } from 'lucide-react';
import { api } from '@/api/apiClient';

export default function StatsSection() {
  const [stats, setStats] = useState({
    registeredUsers: null,
    totalPurchases: null,
    playersOnline: null,
    discordMembers: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Status serveur (joueurs en ligne + discord)
        const status = await api.public.status();

        // Pour les vrais compteurs (users + purchases) on peut les récupérer
        // via l'admin dashboard si tu veux, sinon on garde simple pour l'instant
        setStats({
          registeredUsers: null, // on peut l'ajouter plus tard
          totalPurchases: null,
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
      value: loading ? '...' : (stats.playersOnline ?? 0).toLocaleString(),
      icon: Gamepad2,
      color: 'text-yellow-400',
    },
    {
      label: 'Discord Members',
      value: loading ? '...' : (stats.discordMembers ?? 0).toLocaleString(),
      icon: MessageSquare,
      color: 'text-blue-400',
    },
    {
      label: 'Registered Users',
      value: '100+', // Tu pourras le rendre dynamique plus tard
      icon: Users,
      color: 'text-primary',
    },
    {
      label: 'Total Purchases',
      value: '3', // Tu pourras le rendre dynamique plus tard
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