import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * OAuth callback — Supabase redirects here after Google / Discord sign-in.
 * Exchanges the auth code for a session and stores cookies via SSR client.
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  if (errorParam) {
    const message = encodeURIComponent(errorDescription || errorParam);
    return NextResponse.redirect(`${origin}/login?error=${message}`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_auth_code`);
  }

  const supabase = await createClient();
  const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code);

  console.log('[DEBUG oauth callback] exchangeCodeForSession -> user:', sessionData?.user?.id, sessionData?.user?.email, 'error:', error);

  if (error) {
    console.log('[DEBUG oauth callback] exchange failed -> redirecting to /login with error');
    const message = encodeURIComponent(error.message);
    return NextResponse.redirect(`${origin}/login?error=${message}`);
  }

  let safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';

  // No explicit destination was requested (plain /login OAuth sign-in) —
  // send staff straight to /admin, same as the email/password login flow.
  if (safeNext === '/' && sessionData?.user) {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('staff_role')
      .eq('id', sessionData.user.id)
      .maybeSingle();

    console.log('[DEBUG oauth callback] staff_role lookup for', sessionData.user.email, '->', profile, 'error:', profileError);

    if (profile && ['admin', 'moderator', 'helper'].includes(profile.staff_role)) {
      console.log('[DEBUG oauth callback] staff detected -> redirecting to /admin');
      safeNext = '/admin';
    } else {
      console.log('[DEBUG oauth callback] NOT staff (or no profile row) -> staying on', safeNext, '- staff_role was:', profile?.staff_role);
    }
  }

  console.log('[DEBUG oauth callback] final redirect ->', safeNext);

  return NextResponse.redirect(`${origin}${safeNext}`);
}
