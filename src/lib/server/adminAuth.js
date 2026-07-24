import { cookies } from 'next/headers';

export async function requireAdmin() {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get('admin-auth')?.value;

  if (adminCookie !== 'logged-in') {
    return { error: 'Unauthorized', status: 401 };
  }

  return {
    user: { id: 'admin', email: 'admin@local' },
    profile: { display_name: 'Admin' },
  };
}
