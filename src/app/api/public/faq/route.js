import { getAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/server/api-response';

export async function GET() {
  try {
    const admin = getAdminClient();
    const { data, error } = await admin.from('faq').select('*').eq('is_active', true).order('sort_order');
    if (error) return jsonError(error.message, 500);
    return jsonOk({ faq: data });
  } catch (err) {
    return jsonError(err.message, 500);
  }
}