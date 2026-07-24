import { getAdminClient } from '@/lib/supabase/admin';
import { deliverPurchase } from '@/lib/server/rcon';
import { logAudit, getClientIp } from '@/lib/server/audit';
import { jsonOk, jsonError } from '@/lib/server/api-response';

const COMPLETED_EVENT = 'PAYMENT.CAPTURE.COMPLETED';
const FAILED_EVENTS = new Set([
  'PAYMENT.CAPTURE.DENIED',
  'PAYMENT.CAPTURE.DECLINED',
  'PAYMENT.CAPTURE.REVERSED',
]);

function getPurchaseReference(event) {
  return event.resource?.custom_id || event.resource?.purchase_units?.[0]?.custom_id;
}

function getTransactionId(event) {
  return event.resource?.id || event.resource?.supplementary_data?.related_ids?.capture_id || null;
}

function getCapturedAmount(event) {
  return event.resource?.amount?.value || event.resource?.purchase_units?.[0]?.amount?.value || null;
}

async function verifyPayPalWebhook(request, event) {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const apiBase = process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

  if (!clientId || !clientSecret || !webhookId) {
    throw new Error('PayPal webhook is not fully configured');
  }

  const tokenResponse = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  const token = await tokenResponse.json();
  if (!tokenResponse.ok || !token.access_token) {
    throw new Error('Unable to authenticate with PayPal');
  }

  const verificationResponse = await fetch(`${apiBase}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: request.headers.get('paypal-auth-algo'),
      cert_url: request.headers.get('paypal-cert-url'),
      transmission_id: request.headers.get('paypal-transmission-id'),
      transmission_sig: request.headers.get('paypal-transmission-sig'),
      transmission_time: request.headers.get('paypal-transmission-time'),
      webhook_id: webhookId,
      webhook_event: event,
    }),
  });
  const verification = await verificationResponse.json();

  return verificationResponse.ok && verification.verification_status === 'SUCCESS';
}

export async function POST(request) {
  let event;
  try {
    event = await request.json();
  } catch {
    return jsonError('Invalid payload', 400);
  }

  try {
    if (!(await verifyPayPalWebhook(request, event))) {
      return jsonError('Invalid PayPal webhook signature', 400);
    }
  } catch (error) {
    return jsonError(error.message || 'PayPal webhook verification failed', 503);
  }

  const purchaseId = getPurchaseReference(event);
  if (!purchaseId) return jsonError('Missing purchase reference', 400);

  const admin = getAdminClient();
  const { data: purchase, error } = await admin
    .from('purchases')
    .select('*')
    .eq('id', purchaseId)
    .single();

  if (error || !purchase) return jsonError('Purchase not found', 404);

  const transactionId = getTransactionId(event);

  if (FAILED_EVENTS.has(event.event_type)) {
    if (purchase.status === 'pending') {
      const { error: updateError } = await admin
        .from('purchases')
        .update({
          status: 'failed',
          delivery_status: 'pending',
          transaction_id: transactionId || purchase.transaction_id,
          notes: `PayPal reported ${event.event_type}`,
        })
        .eq('id', purchase.id)
        .eq('status', 'pending');
      if (updateError) return jsonError(updateError.message, 500);
    }
    return jsonOk({ received: true, status: 'failed' });
  }

  // An approval is not a captured payment and must never deliver a rank.
  if (event.event_type !== COMPLETED_EVENT) {
    return jsonOk({ received: true, skipped: true });
  }

  const capturedAmount = getCapturedAmount(event);
  if (capturedAmount && Number(capturedAmount) !== Number(purchase.amount)) {
    return jsonError('Payment amount does not match the purchase', 400);
  }

  if (purchase.status !== 'pending') {
    return jsonOk({ received: true, already_processed: true, status: purchase.status });
  }

  // Claim the pending purchase before fulfillment so repeated webhooks cannot
  // deliver the same rank twice.
  const { data: claimedPurchase, error: claimError } = await admin
    .from('purchases')
    .update({
      status: 'completed',
      transaction_id: transactionId || purchase.transaction_id,
    })
    .eq('id', purchase.id)
    .eq('status', 'pending')
    .select()
    .maybeSingle();

  if (claimError) return jsonError(claimError.message, 500);
  if (!claimedPurchase) return jsonOk({ received: true, already_processed: true });

  const { data: product, error: productError } = await admin
    .from('products')
    .select('*')
    .eq('id', claimedPurchase.product_id)
    .single();

  if (productError || !product) {
    await admin.from('purchases').update({ delivery_status: 'failed', notes: 'Product not found during fulfillment' }).eq('id', claimedPurchase.id);
    return jsonError('Product not found', 404);
  }

  try {
    const commandsExecuted = await deliverPurchase(product, claimedPurchase.minecraft_username);
    const { error: deliveryUpdateError } = await admin
      .from('purchases')
      .update({ delivery_status: 'delivered', commands_executed: commandsExecuted })
      .eq('id', claimedPurchase.id);
    if (deliveryUpdateError) return jsonError(deliveryUpdateError.message, 500);
  } catch (rconError) {
    await admin
      .from('purchases')
      .update({ delivery_status: 'failed', commands_executed: [], notes: rconError.message })
      .eq('id', claimedPurchase.id);

    await logAudit({
      action: 'paypal_delivery_failed',
      category: 'store',
      details: rconError.message,
      userId: claimedPurchase.user_id,
      userName: claimedPurchase.buyer_email,
      ipAddress: getClientIp(request),
      severity: 'error',
    });
    return jsonError('Payment recorded but rank delivery failed', 500);
  }

  await logAudit({
    action: 'paypal_purchase_fulfilled',
    category: 'store',
    details: claimedPurchase.id,
    userId: claimedPurchase.user_id,
    userName: claimedPurchase.buyer_email,
    ipAddress: getClientIp(request),
  });

  return jsonOk({ received: true, fulfilled: true });
}
