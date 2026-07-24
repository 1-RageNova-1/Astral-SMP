import { getAdminClient } from '@/lib/supabase/admin';
import { jsonOk, jsonError } from '@/lib/server/api-response';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const featured = searchParams.get('featured') === 'true';
    const limit = searchParams.get('limit');

    const admin = getAdminClient();

    let query = admin
      .from('news')
      .select('*')
      .eq('is_published', true)
      .order('published_date', {
        ascending: false,
        nullsFirst: false,
      });

    if (featured) query = query.eq('is_featured', true);
    if (limit) query = query.limit(parseInt(limit, 10));

    const { data, error } = await query;

    // 🔥 DEBUG LOG
    if (error) {
      console.error('[NEWS API ERROR]', error);
      return jsonError(error.message, 500);
    }

   

    return jsonOk({
      news: data ?? [], // IMPORTANT FIX
    });

  } catch (err) {
    console.error('[NEWS API CRASH]', err);
    return jsonError(err.message || 'Failed to fetch news', 500);
  }
}