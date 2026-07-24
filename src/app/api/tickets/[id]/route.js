import { z } from 'zod';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireAuth } from '@/lib/server/auth';
import { jsonError, jsonOk } from '@/lib/server/api-response';

const updateSchema = z.object({ status: z.literal('closed') });

async function getOwnedTicket(admin, ticketId, userId) {
  return admin
    .from('tickets')
    .select('id, user_id, subject, category, status, created_at, updated_at, assigned_staff_id, assigned_staff:users!tickets_assigned_staff_id_fkey(display_name, email)')
    .eq('id', ticketId)
    .eq('user_id', userId)
    .maybeSingle();
}

export async function GET(_request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return jsonError(auth.error, auth.status);

  const { id } = await params;
  const admin = getAdminClient();
  const { data: ticket, error } = await getOwnedTicket(admin, id, auth.user.id);
  if (error) return jsonError(error.message, 500);
  if (!ticket) return jsonError('Ticket not found', 404);

  const { data: messages, error: messagesError } = await admin
    .from('ticket_messages')
    .select('id, sender_id, message, created_at, sender:users(display_name, email, avatar_url, staff_role)')
    .eq('ticket_id', ticket.id)
    .order('created_at');

  if (messagesError) return jsonError(messagesError.message, 500);
  return jsonOk({ ticket, messages: messages ?? [] });
}

export async function PATCH(request, { params }) {
  const auth = await requireAuth();
  if (auth.error) return jsonError(auth.error, auth.status);

  let body;
  try {
    body = updateSchema.parse(await request.json());
  } catch {
    return jsonError('Users may only close their own tickets', 400);
  }

  const { id } = await params;
  const admin = getAdminClient();
  const { data: ticket, error } = await admin
    .from('tickets')
    .update({ status: body.status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', auth.user.id)
    .neq('status', 'closed')
    .select('id, subject, category, status, created_at, updated_at, assigned_staff_id')
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!ticket) return jsonError('Ticket not found or already closed', 404);
  return jsonOk({ ticket });
}
