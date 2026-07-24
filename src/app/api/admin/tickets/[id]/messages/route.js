import { z } from 'zod';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireStaff } from '@/lib/server/staffAuth';
import { jsonError, jsonOk } from '@/lib/server/api-response';

const messageSchema = z.object({ message: z.string().trim().min(1).max(4000) });

export async function POST(request, { params }) {
  const auth = await requireStaff();
  if (auth.error) return jsonError(auth.error, auth.status);

  let body;
  try {
    body = messageSchema.parse(await request.json());
  } catch (error) {
    return jsonError(error.errors?.[0]?.message || 'Invalid message', 400);
  }

  const { id } = await params;
  const admin = getAdminClient();
  const { data: ticket, error: ticketError } = await admin
    .from('tickets')
    .select('id, status')
    .eq('id', id)
    .maybeSingle();
  if (ticketError) return jsonError(ticketError.message, 500);
  if (!ticket) return jsonError('Ticket not found', 404);
  if (ticket.status === 'closed') return jsonError('Reopen the ticket before replying', 409);

  const { data: message, error: messageError } = await admin
    .from('ticket_messages')
    .insert({ ticket_id: id, sender_id: auth.user.id, message: body.message })
    .select('id, sender_id, message, created_at')
    .single();
  if (messageError) return jsonError(messageError.message, 500);

  await admin
    .from('tickets')
    .update({ status: 'pending', assigned_staff_id: auth.user.id, updated_at: new Date().toISOString() })
    .eq('id', id);

  return jsonOk({ message });
}
