import { NextResponse } from 'next/server';

const PROTECTED = ['/admin'];

const ADMIN_PUBLIC = ['/admin/login'];

export function middleware(request) {
  const path = request.nextUrl.pathname;



  const isProtected = PROTECTED.some(
    (p) => path === p || path.startsWith(`${p}/`)
  );

  if (!isProtected) {
    return NextResponse.next();
  }

  // 🚨 IMPORTANT: allow admin login page ALWAYS
  const isAdminLogin = ADMIN_PUBLIC.some(
    (p) => path === p || path.startsWith(p)
  );

  if (isAdminLogin) {
    return NextResponse.next();
  }

  const adminCookie = request.cookies.get('admin-auth')?.value;

const isAdminRoute =
  path === '/admin' || path.startsWith('/admin/');

if (isAdminRoute) {
  if (adminCookie !== 'logged-in') {
    return NextResponse.redirect(
      new URL('/admin/login', request.url)
    );
  }
}

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
