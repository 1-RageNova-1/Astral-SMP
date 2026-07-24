'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, Suspense } from 'react';
import { Toaster } from 'sonner';
import ScrollToTop from '@/components/ScrollToTop';
import { AuthProvider } from '@/contexts/AuthContext';

export default function Providers({ children }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Suspense fallback={null}>
          <ScrollToTop />
        </Suspense>

        {children}
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}