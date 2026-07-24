import { getAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/server/adminAuth';
import { getSettingsCategory } from '@/lib/settings';
import { jsonOk, jsonError } from '@/lib/server/api-response';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return jsonError(auth.error, auth.status);

  const admin = getAdminClient();
  const { data, error } = await admin.from('settings').select('*');
  if (error) return jsonError(error.message, 500);

  return jsonOk({ settings: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
}

export async function POST(request) {
  const auth = await requireAdmin();
  console.log('[admin/settings POST] auth status:', auth.error ? auth.error : 'ok');

  if (auth.error) return jsonError(auth.error, auth.status);

  let body;
  try {
    body = await request.json();
  } catch (err) {
    console.log('[admin/settings POST] request.json() failed:', err.message);
    return jsonError('Invalid JSON body', 400);
  }

  console.log('[admin/settings POST] request body received:', JSON.stringify(body));

  const { settings } = body ?? {};
  if (!Array.isArray(settings)) {
    return jsonError('Invalid settings', 400);
  }

  const rows = settings
    .filter((item) => item?.key)
    .map(({ key, value, category }) => ({
      key,
      value: String(value ?? ''),
      category: category || getSettingsCategory(key),
    }));

  if (rows.length === 0) {
    return jsonError('No settings to save', 400);
  }

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('settings')
    .upsert(rows, { onConflict: 'key' })
    .select('*');

  console.log('[admin/settings POST] Supabase response:', { data, error });

  if (error) return jsonError(error.message, 500);

  return jsonOk({ settings: data ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
}
