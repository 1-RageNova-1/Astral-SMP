import { getAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/server/api-response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from('server_stats')
      .select('*')
      .eq('id', 1)
      .single();

    if (error) return jsonError(error.message, 500);

    return jsonOk(data ?? {}, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    return jsonError(err.message || 'Failed to load status', 500);
  }
}