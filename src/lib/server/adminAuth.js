import { requireStaff, STAFF_ROLES } from '@/lib/server/staffAuth';

/**
 * Admin-area auth check.
 * Migrated from the legacy `admin-auth` cookie system to Supabase auth +
 * `public.users.staff_role`. Any staff role (admin, moderator, helper) may
 * pass; route-specific handlers can further restrict by profile.staff_role
 * if a route needs to be admin-only.
 */
export async function requireAdmin() {
  return requireStaff();
}

export { STAFF_ROLES };
