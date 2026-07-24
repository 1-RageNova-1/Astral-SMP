import { z } from 'zod';
import { getAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { deliverPurchase, isValidMinecraftUsername } from '@/lib/server/rcon';
import { logAudit, getClientIp } from '@/lib/server/audit';
import { jsonOk, jsonError } from '@/lib/server/api-response';

const buySchema = z.object({
  product_id: z.string().uuid(),
  minecraft_username: z.string().min(3).max(16),
  payment_method: z.enum(['paypal', 'stripe', 'tebex', 'other', 'manual']).optional(),
  transaction_id: z.string().optional(),
  /** Set true only from PayPal webhook or admin — never trust client alone for paid orders */
  payment_confirmed: z.boolean().optional(),
});

export async function POST(request) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData?.user ?? null;

  let body;
  try {
    body = buySchema.parse(await request.json());
  } catch (e) {
    return jsonError(e.errors?.[0]?.message || 'Invalid request', 400);
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

  const amount = product.sale_price ?? product.price;

  // Purchases require server-side payment confirmation (webhook or manual admin)
  if (!body.payment_confirmed) {
    const { data: purchase, error } = await admin
      .from('purchases')
      .insert({
        user_id: user?.id ?? null,
        product_id: product.id,
        product_title: product.title,
        amount,
        payment_method: body.payment_method || 'paypal',
        status: 'pending',
        minecraft_username: body.minecraft_username,
        buyer_email: user?.email ?? null,
        transaction_id: body.transaction_id || null,
        delivery_status: 'pending',
      })
      .select()
      .single();

    if (error) return jsonError(error.message, 500);

    await logAudit({
      action: 'purchase_created',
      category: 'store',
      details: `Pending purchase ${purchase.id} for ${product.title}`,
      userId: user?.id ?? null,
      userName: user?.email || 'Guest',
      ipAddress: getClientIp(request),
    });

    return jsonOk({
      purchase,
      message: 'Purchase recorded. Complete payment to receive your rank.',
      requires_payment: true,
    });
  }

  if (!user) {
    return jsonError('Confirmed purchases require authentication', 403);
  }

  const { data: purchase, error: purchaseError } = await admin
    .from('purchases')
    .insert({
      user_id: user.id,
      product_id: product.id,
      product_title: product.title,
      amount,
      payment_method: body.payment_method || 'paypal',
      status: 'completed',
      minecraft_username: body.minecraft_username,
      buyer_email: user.email,
      transaction_id: body.transaction_id || null,
      delivery_status: 'pending',
    })
    .select()
    .single();

  if (purchaseError) return jsonError(purchaseError.message, 500);

  let commandsExecuted = [];
  let deliveryStatus = 'delivered';

  try {
    commandsExecuted = await deliverPurchase(product, body.minecraft_username);
  } catch (rconErr) {
    deliveryStatus = 'failed';
    await admin
      .from('purchases')
      .update({
        status: 'completed',
        delivery_status: 'failed',
        commands_executed: [],
        notes: rconErr.message,
      })
      .eq('id', purchase.id);

    await logAudit({
      action: 'purchase_delivery_failed',
      category: 'store',
      details: rconErr.message,
      userId: user.id,
      userName: user.email,
      ipAddress: getClientIp(request),
      severity: 'error',
    });

    return jsonError('Payment recorded but rank delivery failed. Contact support.', 500);
  }

  const { data: updated } = await admin
    .from('purchases')
    .update({
      status: 'completed',
      delivery_status: deliveryStatus,
      commands_executed: commandsExecuted,
    })
    .eq('id', purchase.id)
    .select()
    .single();

  await logAudit({
    action: 'purchase_delivered',
    category: 'store',
    details: `Delivered ${product.title} to ${body.minecraft_username}`,
    userId: user.id,
    userName: user.email,
    ipAddress: getClientIp(request),
  });

  return jsonOk({ purchase: updated, delivered: true });
}
