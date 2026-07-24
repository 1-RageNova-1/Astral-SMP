'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Swords,
  Settings,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const MENU = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/tickets', label: 'Tickets', icon: MessageSquare },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebar({ onNavigate }) {
  const pathname = usePathname();
  const router = useRouter();

  // 🔐 LOGOUT FUNCTION — Supabase auth.signOut() replaces the old admin-auth cookie
  const handleLogout = async () => {
    const supabase = createClient();
    if (supabase) {
      await supabase.auth.signOut();
    }

    router.push('/');
    router.refresh();
  };

  return (
    <aside className="w-64 shrink-0 glass-strong min-h-screen border-r border-border/30 p-4 hidden lg:block">
      
      {/* HEADER */}
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
          <Swords className="w-4 h-4 text-primary" />
        </div>
        <div>
          <span className="font-display text-xs text-primary">ADMIN</span>
          <p className="text-xs text-muted-foreground">Astral Dupes</p>
        </div>
      </div>

      {/* MENU */}
      <nav className="space-y-1">
        {MENU.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.path;

          return (
            <Link key={item.path} href={item.path} onClick={onNavigate}>
              <div
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER ACTIONS */}
      <div className="mt-8 pt-4 border-t border-border/30 space-y-2">

        {/* LOGOUT */}
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="sm"
          className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
        >
          <LogOut className="w-3.5 h-3.5 mr-2" />
          Logout
        </Button>

        {/* BACK TO SITE */}
        <Link href="/">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground text-xs"
          >
            Back to Site
          </Button>
        </Link>

      </div>
    </aside>
  );
}
