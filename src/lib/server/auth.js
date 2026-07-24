import { createClient } from '@/lib/supabase/server';

export async function requireAuth() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();

  console.log('[DEBUG requireAuth] supabase.auth.getUser() ->', {
    userId: data?.user?.id,
    email: data?.user?.email,
    error,
  });

  if (error || !data?.user) {
    console.log('[DEBUG requireAuth] no user / error -> returning 403 Unauthorized');
    return {
      error: 'Unauthorized',
      status: 403,
    };
  }

  return {
    user: data.user,
  };
}