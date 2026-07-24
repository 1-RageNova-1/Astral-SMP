import { getAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/server/api-response';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const featured = searchParams.get('featured') === 'true';
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');

    const admin = getAdminClient();

    let query = admin
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (featured) query = query.eq('is_featured', true);
    if (category) query = query.eq('category', category);
    if (limit) query = query.limit(parseInt(limit, 10));

    const { data, error } = await query;

    // 🔥 DEBUG LOG
    if (error) {
      console.error('[STORE API ERROR]', error);
      return jsonError(error.message, 500);
    }

    

    return jsonOk({
      products: data ?? [], // IMPORTANT FIX
    });

  } catch (err) {
    console.error('[STORE API CRASH]', err);
    return jsonError(err.message || 'Failed to list products', 500);
  }
}