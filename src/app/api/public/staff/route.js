import { getAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/server/api-response';

export async function GET() {
  try {
    const admin = getAdminClient();
    const { data, error } = await admin.from('staff').select('*').eq('is_active', true).order('sort_order');
    if (error) return jsonError(error.message, 500);
    return jsonOk({ staff: data });
  } catch (err) {
    return jsonError(err.message, 500);
  }
}