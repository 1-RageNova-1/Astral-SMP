import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/server/auth';

const STAFF_ROLES = ['helper', 'moderator', 'admin'];

export async function requireStaff() {
  const auth = await requireAuth();
  if (auth.error) {
    console.log('[DEBUG requireStaff] requireAuth failed:', auth.error, auth.status);
    return auth;
  }

  console.log('[DEBUG requireStaff] checking staff_role for user:', auth.user.id, auth.user.email);

  const admin = getAdminClient();
  const { data: profile, error } = await admin
    .from('users')
    .select('id, email, display_name, staff_role')
    .eq('id', auth.user.id)
    .maybeSingle();

  console.log('[DEBUG requireStaff] profile query result:', profile, 'error:', error, 'allowed roles:', STAFF_ROLES);

  if (error || !profile || !STAFF_ROLES.includes(profile.staff_role)) {
    console.log(
      '[DEBUG requireStaff] BLOCKED - reason:',
      error ? 'query error' : !profile ? 'no profile row found for this id' : `staff_role "${profile.staff_role}" not in allowed list`
    );
    return { error: 'Staff access required', status: 403 };
  }

  console.log('[DEBUG requireStaff] ALLOWED - staff_role:', profile.staff_role);

  return { user: auth.user, profile };
}

export { STAFF_ROLES };
