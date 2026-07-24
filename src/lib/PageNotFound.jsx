'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

export default function PageNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center">
        <h1 className="font-display text-4xl text-primary mb-4">404</h1>
        <p className="text-muted-foreground mb-6">Page not found</p>
        <Link href="/">
          <Button className="bg-primary">
            <Home className="w-4 h-4 mr-2" /> Back Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
