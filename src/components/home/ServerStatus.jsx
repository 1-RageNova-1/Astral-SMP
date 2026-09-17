'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/shared/GlassCard';
import { Wifi, WifiOff, Users, Clock, Server, Activity } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';

function unwrap(payload) {
  if (!payload || typeof payload !== 'object') return null;
  if (payload.is_online !== undefined || payload.player_count !== undefined) return payload;
  if (payload.data && typeof payload.data === 'object') return payload.data;
  return payload;
}

export default function ServerStatus() {
  const { data: settings } = useSettings();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const fetchStatus = async () => {
      try {
        const res = await fetch('/api/public/status', { cache: 'no-store' });
        const json = await res.json();
        const parsed = unwrap(json);
        if (!cancelled) {
          setStatus(parsed);
          setError(res.ok ? null : json.error || 'Erreur status');
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 20000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  const online = Boolean(status?.is_online);
  const players = status?.player_count ?? 0;
  const maxPlayers = status?.max_players ?? '?';

  const items = [
    {
      icon: online ? Wifi : WifiOff,
      label: 'Status',
      value: loading ? '...' : online ? 'Online' : 'Offline',
      color: online ? 'text-green-400' : 'text-red-400',
    },
    {
      icon: Users,
      label: 'Players',
      value: loading ? '...' : `${players}/${maxPlayers}`,
      color: 'text-accent',
    },
    {
      icon: Server,
      label: 'Version',
      value: status?.version || settings?.server_version || '—',
      color: 'text-primary',
    },
    {
      icon: Activity,
      label: 'Ping',
      value: status?.ping != null ? `${status.ping}ms` : '—',
      color: 'text-yellow-400',
    },
  ];

  const cleanMotd = status?.motd
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
              {error ? `Erreur: ${error}` : cleanMotd || 'Astral SMP'}
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <Clock className="w-3 h-3" />
              Auto-refresh 20s
            </span>
          </div>
        </GlassCard>
      </div>
    </section>
  );
}