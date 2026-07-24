import { getAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/server/api-response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const admin = getAdminClient();
    const { data, error } = await admin.from('settings').select('key,value,category,updated_at');

    if (error) return jsonError(error.message, 500);

    return jsonOk({ settings: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return jsonError(err.message || 'Failed to load settings', 500);
  }
}