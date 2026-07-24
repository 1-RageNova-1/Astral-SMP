import { getAdminClient } from '@/lib/supabase/admin';
import { requireStaff } from '@/lib/server/staffAuth';
import { jsonError, jsonOk } from '@/lib/server/api-response';

export async function GET(request) {
  const auth = await requireStaff();
  if (auth.error) return jsonError(auth.error, auth.status);

  const status = new URL(request.url).searchParams.get('status');
  const admin = getAdminClient();
  let query = admin
    .from('tickets')
    .select('id, user_id, subject, category, status, created_at, updated_at, assigned_staff_id, owner:users!tickets_user_id_fkey(display_name, email, avatar_url), assigned_staff:users!tickets_assigned_staff_id_fkey(display_name, email)')
    .order('updated_at', { ascending: false });

  if (['open', 'pending', 'closed'].includes(status)) query = query.eq('status', status);

  const { data, error } = await query;
  if (error) return jsonError(error.message, 500);
  return jsonOk({ tickets: data ?? [] });
}
