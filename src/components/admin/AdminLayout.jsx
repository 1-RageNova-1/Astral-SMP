'use client';

import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function AdminLayout({ children }) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />

      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="glass border-border/50">
              <Menu className="w-4 h-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-card border-border/30">
            <AdminSidebar onNavigate={() => setSheetOpen(false)} />
          </SheetContent>
        </Sheet>
      </div>

      <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
