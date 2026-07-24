import { redirect } from 'next/navigation';
import Dashboard from '@/views/admin/Dashboard';
import { createClient } from '@/lib/supabase/server';

const STAFF_ROLES = ['helper', 'moderator', 'admin'];

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  console.log('[DEBUG /admin page] supabase user:', user?.id, user?.email);
  if (!user) {
    console.log('[DEBUG /admin page] no user -> redirect to /login');
    redirect('/login?redirect=/admin');
  }

  const { data: profile, error } = await supabase
    .from('users')
    .select('staff_role')
    .eq('id', user.id)
    .maybeSingle();

  console.log('[DEBUG /admin page] profile:', profile, 'error:', error, 'allowed roles:', STAFF_ROLES);

  if (!profile || !STAFF_ROLES.includes(profile.staff_role)) {
    console.log(
      '[DEBUG /admin page] BLOCKED - reason:',
      error ? error.message : !profile ? 'no profile row for this user id (check public.users table)' : `staff_role is "${profile.staff_role}", not in ${JSON.stringify(STAFF_ROLES)}`
    );
    redirect('/');
  }

  console.log('[DEBUG /admin page] ALLOWED - staff_role:', profile.staff_role);

  return <Dashboard />;
}
