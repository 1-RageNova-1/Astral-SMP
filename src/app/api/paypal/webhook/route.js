import { getAdminClient } from '@/lib/supabase/admin';
import { deliverPurchase } from '@/lib/server/rcon';
import { logAudit, getClientIp } from '@/lib/server/audit';
import { jsonOk, jsonError } from '@/lib/server/api-response';

/**
 * PayPal webhook — validates payment server-side and fulfills purchases.
 * Configure PAYPAL_WEBHOOK_ID and verify signatures in production.
 */
export async function POST(request) {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    return jsonError('PayPal webhook not configured', 503);
  }

  let event;
  try {
    event = await request.json();
  } catch {
    return jsonError('Invalid payload', 400);
  }

  // TODO: Verify PayPal transmission signature with PAYPAL_CLIENT_ID/SECRET
  const eventType = event.event_type;

  if (eventType !== 'PAYMENT.CAPTURE.COMPLETED' && eventType !== 'CHECKOUT.ORDER.APPROVED') {
    return jsonOk({ received: true, skipped: true });
  }

  const customId = event.resource?.custom_id || event.resource?.purchase_units?.[0]?.custom_id;
  if (!customId) {
    return jsonError('Missing purchase reference', 400);
  }

  const admin = getAdminClient();
  const { data: purchase, error } = await admin
    .from('purchases')
    .select('*')
    .eq('id', customId)
    .single();

  if (error || !purchase) {
    return jsonError('Purchase not found', 404);
  }

  if (purchase.status === 'completed' && purchase.delivery_status === 'delivered') {
    return jsonOk({ received: true, already_fulfilled: true });
  }

  const { data: product, error: productError } = await admin
    .from('products')
    .select('*')
    .eq('id', purchase.product_id)
    .single();

  if (productError || !product) {
    return jsonError('Product not found', 404);
  }

  let commandsExecuted = [];
  let deliveryStatus = 'delivered';

  try {
    commandsExecuted = await deliverPurchase(product, purchase.minecraft_username);
  } catch (rconErr) {
    deliveryStatus = 'failed';
    await admin
      .from('purchases')
      .update({
        status: 'completed',
        delivery_status: 'failed',
        notes: rconErr.message,
        transaction_id: event.resource?.id || purchase.transaction_id,
      })
      .eq('id', purchase.id);

    await logAudit({
      action: 'paypal_delivery_failed',
      category: 'store',
      details: rconErr.message,
      ipAddress: getClientIp(request),
      severity: 'error',
    });

    return jsonError('Delivery failed', 500);
  }

  await admin
    .from('purchases')
    .update({
      status: 'completed',
      delivery_status: deliveryStatus,
      commands_executed: commandsExecuted,
      transaction_id: event.resource?.id || purchase.transaction_id,
    })
    .eq('id', purchase.id);

  await logAudit({
    action: 'paypal_purchase_fulfilled',
    category: 'store',
    details: purchase.id,
    ipAddress: getClientIp(request),
  });

  return jsonOk({ received: true, fulfilled: true });
}
