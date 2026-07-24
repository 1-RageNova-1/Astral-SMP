import { z } from 'zod';
import { getAdminClient } from '@/lib/supabase/admin';
import { requireStaff } from '@/lib/server/staffAuth';
import { jsonError, jsonOk } from '@/lib/server/api-response';

const updateSchema = z.object({
  status: z.enum(['open', 'pending', 'closed']).optional(),
  assign_to_self: z.boolean().optional(),
}).refine((body) => body.status || body.assign_to_self, { message: 'No ticket update provided' });

export async function GET(_request, { params }) {
  const auth = await requireStaff();
  if (auth.error) return jsonError(auth.error, auth.status);

  const { id } = await params;
  const admin = getAdminClient();
  const { data: ticket, error } = await admin
    .from('tickets')
    .select('id, user_id, subject, category, status, created_at, updated_at, assigned_staff_id, owner:users!tickets_user_id_fkey(display_name, email, avatar_url), assigned_staff:users!tickets_assigned_staff_id_fkey(display_name, email)')
    .eq('id', id)
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!ticket) return jsonError('Ticket not found', 404);

  const { data: messages, error: messagesError } = await admin
    .from('ticket_messages')
    .select('id, sender_id, message, created_at, sender:users(display_name, email, avatar_url, staff_role)')
    .eq('ticket_id', id)
    .order('created_at');
  if (messagesError) return jsonError(messagesError.message, 500);

  return jsonOk({ ticket, messages: messages ?? [] });
}

export async function PATCH(request, { params }) {
  const auth = await requireStaff();
  if (auth.error) return jsonError(auth.error, auth.status);

  let body;
  try {
    body = updateSchema.parse(await request.json());
  } catch (error) {
    return jsonError(error.errors?.[0]?.message || 'Invalid ticket update', 400);
  }

  const { id } = await params;
  const updates = { updated_at: new Date().toISOString() };
  if (body.status) updates.status = body.status;
  if (body.assign_to_self) updates.assigned_staff_id = auth.user.id;

  const admin = getAdminClient();
  const { data: ticket, error } = await admin
    .from('tickets')
    .update(updates)
    .eq('id', id)
    .select('id, user_id, subject, category, status, created_at, updated_at, assigned_staff_id')
    .maybeSingle();

  if (error) return jsonError(error.message, 500);
  if (!ticket) return jsonError('Ticket not found', 404);
  return jsonOk({ ticket });
}
