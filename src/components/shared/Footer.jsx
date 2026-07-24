'use client';

import Link from 'next/link';
import { Swords, MessageSquare, Heart } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';

export default function Footer() {
  const { data: settings } = useSettings();
  const discordInviteUrl = settings?.discord_invite_url;

  return (
    <footer className="relative border-t border-border/50 bg-card/50 backdrop-blur-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
                <Swords className="w-4 h-4 text-primary" />
              </div>
              <span className="font-display text-xs text-primary">ASTRAL DUPES</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {settings?.site_description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">Quick Links</h4>
            <div className="space-y-2.5">
              {[
                { label: 'Home', path: '/' },
                { label: 'Store', path: '/store' },
                { label: 'News', path: '/news' },
                { label: 'Vote', path: '/vote' },
              ].map(link => (
                <Link key={link.path} href={link.path} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">Support</h4>
            <div className="space-y-2.5">
              {[
                { label: 'FAQ', path: '/faq' },
                { label: 'Support Tickets', path: '/support' },
                { label: 'Staff Team', path: '/staff' },
                { label: 'About Us', path: '/about' },
              ].map(link => (
                <Link key={link.path} href={link.path} className="block text-sm text-muted-foreground hover:text-primary transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Community */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">Community</h4>
            <div className="space-y-2.5">
              <a href={discordInviteUrl || '/support'} target={discordInviteUrl ? '_blank' : undefined} rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors">
                <MessageSquare className="w-4 h-4" /> Discord Server
              </a>
              <p className="text-sm text-muted-foreground">{settings?.server_ip}</p>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © 2026 Astral Dupes. Not affiliated with Mojang Studios.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-destructive" /> by Astral Team
          </p>
        </div>
      </div>
    </footer>
  );
}
