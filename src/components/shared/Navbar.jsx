'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingCart, MessageSquare, Users, HelpCircle, Newspaper, HeadphonesIcon, Vote, Swords, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/hooks/use-settings';

const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/about', label: 'About', icon: Users },
  { path: '/faq', label: 'FAQ', icon: HelpCircle },
  { path: '/store', label: 'Store', icon: ShoppingCart },
  { path: '/news', label: 'News', icon: Newspaper },
  { path: '/support', label: 'Support', icon: HeadphonesIcon },
  { path: '/staff', label: 'Staff', icon: Swords },
  { path: '/vote', label: 'Vote', icon: Vote },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: settings } = useSettings();
  const discordInviteUrl = settings?.discord_invite_url;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Swords className="w-5 h-5 text-primary" />
            </div>
            <span className="font-display text-xs sm:text-sm text-primary text-glow-purple">
              ASTRAL
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-xs font-medium transition-all ${
                      isActive
                        ? 'text-primary bg-primary/10'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 mr-1.5" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <a href={discordInviteUrl || '/support'} target={discordInviteUrl ? '_blank' : undefined} rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-accent" disabled={!discordInviteUrl}>
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline ml-1.5">Discord</span>
              </Button>
            </a>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-muted-foreground"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-strong border-t border-border/50 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                return (
                  <Link key={item.path} href={item.path} onClick={() => setIsOpen(false)}>
                    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary'
                    }`}>
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
