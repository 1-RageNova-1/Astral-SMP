import { z } from 'zod';
import { getAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { isValidMinecraftUsername } from '@/lib/server/rcon';
import { logAudit, getClientIp } from '@/lib/server/audit';
import { jsonOk, jsonError } from '@/lib/server/api-response';

const buySchema = z.object({
  product_id: z.string().uuid(),
  minecraft_username: z.string().trim().min(3).max(16),
  payment_method: z.enum(['paypal', 'stripe', 'tebex', 'other', 'manual']).optional(),
});

async function findPendingPurchase(admin, userId, productId, minecraftUsername) {
  const { data, error } = await admin
    .from('purchases')
    .select('*')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .eq('minecraft_username', minecraftUsername)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  const user = authData?.user ?? null;

  if (authError || !user) {
    return jsonError('Authentication required', 401);
  }

  let body;
  try {
    body = buySchema.parse(await request.json());
  } catch (error) {
    return jsonError(error.errors?.[0]?.message || 'Invalid request', 400);
  }

  if (!isValidMinecraftUsername(body.minecraft_username)) {
    return jsonError('Invalid Minecraft username', 400);
  }

  const admin = getAdminClient();
  const { data: product, error: productError } = await admin
    .from('products')
    .select('*')
    .eq('id', body.product_id)
    .eq('is_active', true)
    .single();

  if (productError || !product) {
    return jsonError('Product not found', 404);
  }

  try {
    const existingPending = await findPendingPurchase(admin, user.id, product.id, body.minecraft_username);
    if (existingPending) {
      return jsonOk({
        purchase: existingPending,
        message: 'Purchase already recorded. Complete payment to receive your rank.',
        requires_payment: true,
        existing: true,
      });
    }
  } catch (error) {
    return jsonError(error.message, 500);
  }

  // A browser can only create a pending order. Completion is reserved for a
  // verified payment webhook or a trusted server-side administrative action.
  const { data: purchase, error: purchaseError } = await admin
    .from('purchases')
    .insert({
      user_id: user.id,
      product_id: product.id,
      product_title: product.title,
      amount: product.sale_price ?? product.price,
      payment_method: body.payment_method || 'paypal',
      status: 'pending',
      minecraft_username: body.minecraft_username,
      buyer_email: user.email ?? null,
      delivery_status: 'pending',
    })
    .select()
    .single();

  if (purchaseError) {
    // The partial unique index handles simultaneous requests safely.
    if (purchaseError.code === '23505') {
      try {
        const duplicate = await findPendingPurchase(admin, user.id, product.id, body.minecraft_username);
        if (duplicate) {
          return jsonOk({
            purchase: duplicate,
            message: 'Purchase already recorded. Complete payment to receive your rank.',
            requires_payment: true,
            existing: true,
          });
        }
      } catch {
        // Return the original insert error if the follow-up read fails.
      }
    }
    return jsonError(purchaseError.message, 500);
  }

  await logAudit({
    action: 'purchase_created',
    category: 'store',
    details: `Pending purchase ${purchase.id} for ${product.title}`,
    userId: user.id,
    userName: user.email,
    ipAddress: getClientIp(request),
  });

  return jsonOk({
    purchase,
    message: 'Purchase recorded. Complete payment to receive your rank.',
    requires_payment: true,
  });
}
