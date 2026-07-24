/**
 * Canonical OAuth redirect URI for this app (must match Supabase redirect URLs).
 */
export function getAuthCallbackUrl() {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/auth/callback`;
  }
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    return `${siteUrl.replace(/\/$/, '')}/auth/callback`;
  }
  return 'http://localhost:3000/auth/callback';
}
