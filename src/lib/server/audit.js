import { getAdminClient } from '@/lib/supabase/admin';

export async function logAudit({
  action,
  category,
  details,
  userId,
  userName,
  ipAddress,
  severity = 'info',
}) {
  try {
    const admin = getAdminClient();
    await admin.from('audit_logs').insert({
      action,
      category,
      details,
      user_id: userId || null,
      user_name: userName || null,
      ip_address: ipAddress || null,
      severity,
    });
  } catch (err) {
    console.error('Audit log failed:', err);
  }
}

export function getClientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    null
  );
}
