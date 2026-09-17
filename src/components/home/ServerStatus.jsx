'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/shared/GlassCard';
import { Wifi, WifiOff, Users, Clock, Server, Activity } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { api } from '@/api/apiClient';

export default function ServerStatus() {
  const { data: settings } = useSettings();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const data = await api.public.status();
        setStatus(data);
      } catch (e) {
        console.error('Failed to load server status:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 15000); // refresh toutes les 15s
    return () => clearInterval(interval);
  }, []);

  if (loading || !status) {
    return (
      <section className="py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <GlassCard hover={false} className="p-6 text-center text-muted-foreground">
            Chargement du statut...
          </GlassCard>
        </div>
      </section>
    );
  }

  const items = [
    {
      icon: status.is_online ? Wifi : WifiOff,
      label: 'Status',
      value: status.is_online ? 'Online' : 'Offline',
      color: status.is_online ? 'text-green-400' : 'text-red-400',
    },
    {
      icon: Users,
      label: 'Players',
      value: `${status.player_count ?? 0}/${status.max_players ?? '?'}`,
      color: 'text-accent',
    },
    {
      icon: Server,
      label: 'Version',
      value: status.version || settings?.server_version || '—',
      color: 'text-primary',
    },
    {
      icon: Activity,
      label: 'Ping',
      value: status.ping != null ? `${status.ping}ms` : '—',
      color: 'text-yellow-400',
    },
  ];

  const cleanMotd = status.motd
    ? String(status.motd).replace(/§[0-9a-fk-or]/gi, '')
    : null;

  return (
    <section className="py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <GlassCard hover={false} className="p-4 sm:p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {items.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30"
                >
                  <div className={`p-2 rounded-lg bg-secondary ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className={`text-sm font-semibold ${item.color}`}>{item.value}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-mono truncate max-w-[70%]">
              {cleanMotd || 'Astral SMP'}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3" />
              Auto-refresh 15s
            </span>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}