import { createClient } from '@/lib/supabase/server';

export async function requireAuth() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return {
      error: 'Unauthorized',
      status: 403,
    };
  }

  return {
    user: data.user,
  };
}