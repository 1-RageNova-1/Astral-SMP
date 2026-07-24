import { createBrowserClient } from '@supabase/ssr';

let browserClient = null;

export function createClient() {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!browserClient) {
    browserClient = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return browserClient;
}
