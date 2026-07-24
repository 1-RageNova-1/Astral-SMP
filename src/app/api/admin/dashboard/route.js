import { getAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/server/adminAuth';
import { jsonOk, jsonError } from '@/lib/server/api-response';

export async function GET() {
  const auth = await requireAdmin();
  if (auth.error) return jsonError(auth.error, auth.status);

  try {
    const admin = getAdminClient();

    const [purchasesResult, ticketsResult, productsResult, newsResult] = await Promise.all([
      admin.from('purchases').select('*, buyer:users(id, email, display_name, avatar_url)').order('created_at', { ascending: false }),
      admin.from('tickets').select('*').order('created_at', { ascending: false }),
      admin.from('products').select('id, title, category').order('sort_order'),
      admin.from('news').select('id').order('created_at', { ascending: false }),
    ]);

    const firstError = [
      purchasesResult.error,
      ticketsResult.error,
      productsResult.error,
      newsResult.error,
    ].find(Boolean);

    if (firstError) return jsonError(firstError.message, 500);

    return jsonOk({
      purchases: purchasesResult.data ?? [],
      tickets: ticketsResult.data ?? [],
      products: productsResult.data ?? [],
      news: newsResult.data ?? [],
    });
  } catch (err) {
    return jsonError(err.message || 'Internal Server Error', 500);
  }
}
