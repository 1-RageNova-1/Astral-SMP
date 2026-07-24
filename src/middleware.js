import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

const STAFF_ROLES = ['helper', 'moderator', 'admin'];

/** User routes that require Supabase auth (admin auth uses staff_role, checked below). */
const AUTH_REQUIRED = ['/store', '/support', '/checkout', '/payment'];

function copySupabaseCookies(from, to) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
}

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthRequired = AUTH_REQUIRED.some(
    (route) => path === route || path.startsWith(`${route}/`)
  );

  if (isAuthRequired && !user) {
    const loginUrl = new URL('/login', request.url);
    const redirectPath = `${path}${request.nextUrl.search}`;
    loginUrl.searchParams.set('redirect', redirectPath);
    const redirect = NextResponse.redirect(loginUrl);
    copySupabaseCookies(supabaseResponse, redirect);
    return redirect;
  }

  const isAdminRoute = path === '/admin' || path.startsWith('/admin/');

  if (!isAdminRoute) {
    return supabaseResponse;
  }

  // /admin/login is a legacy path kept only as a redirect stub to /login.
  // It performs no auth of its own, so let it pass through untouched.
  if (path === '/admin/login') {
    return supabaseResponse;
  }

  // All other /admin/* routes (dashboard, settings, tickets, and any future
  // sub-routes) require a logged-in Supabase user with a staff_role of
  // admin, moderator, or helper.
  if (!user) {
    console.log('[DEBUG middleware] no supabase user on', path, '-> redirecting to /login');
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', `${path}${request.nextUrl.search}`);
    const redirect = NextResponse.redirect(loginUrl);
    copySupabaseCookies(supabaseResponse, redirect);
    return redirect;
  }

  console.log('[DEBUG middleware] user found:', user.id, user.email);

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('staff_role')
    .eq('id', user.id)
    .maybeSingle();

  console.log('[DEBUG middleware] profile lookup for', user.id, '->', profile, 'error:', profileError);

  if (!profile || !STAFF_ROLES.includes(profile.staff_role)) {
    console.log(
      '[DEBUG middleware] BLOCKED admin access for',
      user.email,
      '- profile:', profile,
      '- staff_role:', profile?.staff_role,
      '- allowed roles:', STAFF_ROLES
    );
    const redirect = NextResponse.redirect(new URL('/', request.url));
    copySupabaseCookies(supabaseResponse, redirect);
    return redirect;
  }

  console.log('[DEBUG middleware] ALLOWED admin access for', user.email, 'role:', profile.staff_role);

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
