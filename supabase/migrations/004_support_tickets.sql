-- Replace the legacy embedded-message ticket model with conversations.
-- Existing ticket columns and records are retained for backwards compatibility.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS staff_role TEXT;

ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS users_staff_role_check;

ALTER TABLE public.users
  ADD CONSTRAINT users_staff_role_check
  CHECK (staff_role IS NULL OR staff_role IN ('user', 'helper', 'moderator', 'admin'));

-- Preserve existing Supabase-role administrators as staff members.
UPDATE public.users
SET staff_role = 'admin'
WHERE role = 'admin' AND staff_role IS NULL;

ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS assigned_staff_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

-- Convert old category/status values before applying the new constraints.
UPDATE public.tickets
SET category = CASE category
  WHEN 'billing' THEN 'payment_issue'
  WHEN 'store' THEN 'rank_purchase_issue'
  WHEN 'technical' THEN 'bug_report'
  WHEN 'general' THEN 'general_support'
  ELSE 'other'
END;

UPDATE public.tickets
SET status = CASE status
  WHEN 'open' THEN 'open'
  WHEN 'in_progress' THEN 'pending'
  WHEN 'awaiting_reply' THEN 'pending'
  WHEN 'resolved' THEN 'closed'
  WHEN 'closed' THEN 'closed'
  ELSE 'open'
END;

ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_category_check;
ALTER TABLE public.tickets DROP CONSTRAINT IF EXISTS tickets_status_check;

ALTER TABLE public.tickets
  ADD CONSTRAINT tickets_category_check
  CHECK (category IN ('payment_issue', 'rank_purchase_issue', 'bug_report', 'general_support', 'other'));

ALTER TABLE public.tickets
  ADD CONSTRAINT tickets_status_check
  CHECK (status IN ('open', 'pending', 'closed'));

CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL CHECK (char_length(trim(message)) > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Make each legacy ticket's original description its first conversation entry.
INSERT INTO public.ticket_messages (ticket_id, sender_id, message, created_at)
SELECT t.id, t.user_id, t.description, t.created_at
FROM public.tickets t
WHERE t.description IS NOT NULL
  AND char_length(trim(t.description)) > 0
  AND NOT EXISTS (
    SELECT 1 FROM public.ticket_messages m WHERE m.ticket_id = t.id
  );

CREATE INDEX IF NOT EXISTS idx_tickets_status_updated
  ON public.tickets(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_staff
  ON public.tickets(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_created
  ON public.ticket_messages(ticket_id, created_at);

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
      AND staff_role IN ('helper', 'moderator', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS tickets_own ON public.tickets;
DROP POLICY IF EXISTS tickets_insert_own ON public.tickets;

CREATE POLICY tickets_select_owner_or_staff ON public.tickets
  FOR SELECT USING (user_id = auth.uid() OR public.is_staff());
CREATE POLICY tickets_insert_own ON public.tickets
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY tickets_update_owner_or_staff ON public.tickets
  FOR UPDATE USING (user_id = auth.uid() OR public.is_staff())
  WITH CHECK (user_id = auth.uid() OR public.is_staff());

CREATE POLICY ticket_messages_select_participant ON public.ticket_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR public.is_staff())
    )
  );
CREATE POLICY ticket_messages_insert_participant ON public.ticket_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.tickets t
      WHERE t.id = ticket_id AND (t.user_id = auth.uid() OR public.is_staff())
    )
  );

-- Ticket writes go through the authenticated server routes, which validate
-- ownership, allowed status transitions, and staff assignment. This prevents
-- users from directly promoting themselves or modifying protected fields.
REVOKE INSERT, UPDATE, DELETE ON public.tickets FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.ticket_messages FROM authenticated;
REVOKE UPDATE ON public.users FROM authenticated;
GRANT UPDATE (display_name, minecraft_username, avatar_url) ON public.users TO authenticated;
