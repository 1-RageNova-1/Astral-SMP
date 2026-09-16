'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShoppingCart, MessageSquare, Gamepad2, Copy, Check, LogIn, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { useSettings } from '@/hooks/use-settings';
import { useAuth } from '@/contexts/AuthContext';

export default function HeroSection() {
  const [copied, setCopied] = useState(false);
  const { data: settings } = useSettings();
  const { user, profile, loading: authLoading } = useAuth();
  const serverIp = settings?.server_ip;
  const discordInviteUrl = settings?.discord_invite_url;
  const displayName = profile?.display_name || user?.email?.split('@')[0];

  const copyIP = () => {
    if (!serverIp) return;
    navigator.clipboard.writeText(serverIp);
    setCopied(true);
    toast.success('Server IP copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[100px]" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs font-medium text-accent mb-6"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Server Online — {settings?.server_version}
          </motion.div>

          {/* Title */}
          <h1 className="font-display text-3xl sm:text-5xl md:text-6xl text-primary text-glow-purple mb-4 leading-tight">
            Astral Smp
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-3 font-light">
            {settings?.site_description}
          </p>
          <p className="text-sm text-muted-foreground/70 max-w-xl mx-auto mb-8">
            Join thousands of players across SMP, Lifesteal, Creative, and Dupe Survival game modes. 
            Build, explore, and dominate with your friends.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
            <Button size="lg" className="bg-primary hover:bg-primary/90 glow-purple text-sm px-8 w-full sm:w-auto">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Join Now
            </Button>
            <Link href="/store">
              <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/10 text-sm px-8 w-full sm:w-auto">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Store
              </Button>
            </Link>
            <a href={discordInviteUrl || '/support'} target={discordInviteUrl ? '_blank' : undefined} rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-accent/30 hover:bg-accent/10 text-accent text-sm px-8 w-full sm:w-auto" disabled={!discordInviteUrl}>
                <MessageSquare className="w-4 h-4 mr-2" />
                Discord
              </Button>
            </a>
          </div>

          {!authLoading && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
              {user ? (
                <p className="text-sm text-muted-foreground">
                  Signed in as <span className="text-primary font-medium">{displayName}</span>
                </p>
              ) : (
                <>
                  <Link href="/login">
                    <Button size="sm" variant="outline" className="border-primary/30 hover:bg-primary/10 text-sm px-6 w-full sm:w-auto">
                      <LogIn className="w-4 h-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" variant="outline" className="border-primary/30 hover:bg-primary/10 text-sm px-6 w-full sm:w-auto">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          )}

          {/* Server IP */}
          <motion.button
            onClick={copyIP}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-3 px-6 py-3 rounded-xl glass hover:border-primary/40 transition-all group cursor-pointer"
          >
            <span className="font-mono text-sm text-foreground">{serverIp}</span>
            {copied ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
