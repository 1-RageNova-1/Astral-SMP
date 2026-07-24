import { redirect } from 'next/navigation';

/**
 * Legacy route kept for backwards-compatible links/bookmarks.
 * Admin auth now goes entirely through Supabase — there is no separate
 * admin login form. Anyone hitting this URL is sent to the normal login
 * page; staff are routed on to /admin automatically after signing in.
 */
export default function AdminLoginRedirect() {
  redirect('/login?redirect=%2Fadmin');
}
