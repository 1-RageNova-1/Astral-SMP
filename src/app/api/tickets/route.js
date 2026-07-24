import { z } from 'zod';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/server/auth';
import { jsonError, jsonOk } from '@/lib/server/api-response';

const ticketSchema = z.object({
  subject: z.string().trim().min(3).max(120),
  category: z.enum(['payment_issue', 'rank_purchase_issue', 'bug_report', 'general_support', 'other']),
  message: z.string().trim().min(1).max(4000),
});

export async function GET() {
  const auth = await requireAuth();
  if (auth.error) return jsonError(auth.error, auth.status);

  const admin = getAdminClient();
  const { data, error } = await admin
    .from('tickets')
    .select('id, subject, category, status, created_at, updated_at, assigned_staff_id')
    .eq('user_id', auth.user.id)
    .order('updated_at', { ascending: false });

  if (error) return jsonError(error.message, 500);
  return jsonOk({ tickets: data ?? [] });
}

export async function POST(request) {
  const auth = await requireAuth();
  if (auth.error) return jsonError(auth.error, auth.status);

  let body;
  try {
    body = ticketSchema.parse(await request.json());
  } catch (error) {
    return jsonError(error.errors?.[0]?.message || 'Invalid ticket', 400);
  }

  const admin = getAdminClient();
  const { data: ticket, error: ticketError } = await admin
    .from('tickets')
    .insert({
      user_id: auth.user.id,
      subject: body.subject,
      category: body.category,
      status: 'open',
      description: body.message,
      messages: [],
    })
    .select('id, subject, category, status, created_at, updated_at, assigned_staff_id')
    .single();

  if (ticketError) return jsonError(ticketError.message, 500);

  const { error: messageError } = await admin.from('ticket_messages').insert({
    ticket_id: ticket.id,
    sender_id: auth.user.id,
    message: body.message,
  });

  if (messageError) return jsonError(messageError.message, 500);
  return jsonOk({ ticket }, 201);
}
