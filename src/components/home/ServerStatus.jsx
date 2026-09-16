'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/shared/GlassCard';
import { Wifi, WifiOff, Users, Clock, Server, Activity } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';

export default function ServerStatus() {
  const { data: settings } = useSettings();
  const [status, setStatus] = useState({
    online: true,
    players: 147,
    maxPlayers: 500,
    ping: 42,
    motd: '§6Astral Smp §7- §bSeason 3 Now Live!',
    lastUpdate: new Date().toISOString(),
  });

  const version = settings?.server_version;

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        players: Math.max(50, prev.players + Math.floor(Math.random() * 11) - 5),
        ping: Math.max(10, 35 + Math.floor(Math.random() * 20)),
        lastUpdate: new Date().toISOString(),
      }));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const items = [
    {
      icon: status.online ? Wifi : WifiOff,
      label: 'Status',
      value: status.online ? 'Online' : 'Offline',
      color: status.online ? 'text-green-400' : 'text-red-400',
    },
    { icon: Users, label: 'Players', value: `${status.players}/${status.maxPlayers}`, color: 'text-accent' },
    { icon: Server, label: 'Version', value: version || '—', color: 'text-primary' },
    { icon: Activity, label: 'Ping', value: `${status.ping}ms`, color: 'text-yellow-400' },
  ];

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
            <span className="font-mono">{status.motd.replace(/§[0-9a-fk-or]/g, '')}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Auto-refreshes every 30s
            </span>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}