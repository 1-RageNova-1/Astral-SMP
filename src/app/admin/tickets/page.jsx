import { redirect } from 'next/navigation';
import TicketPanel from '@/components/admin/TicketPanel';
import { createClient } from '@/lib/supabase/server';

const STAFF_ROLES = ['helper', 'moderator', 'admin'];

export default async function AdminTicketsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login?redirect=/admin/tickets');

  const { data: profile } = await supabase
    .from('users')
    .select('staff_role')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile || !STAFF_ROLES.includes(profile.staff_role)) redirect('/');
  return <TicketPanel />;
}
