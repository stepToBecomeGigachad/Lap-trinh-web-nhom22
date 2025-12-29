import { NextResponse } from 'next/server';
import { refreshCookieName, sessionCookieName } from '../../../lib/auth';
import { revokeRefreshToken } from '../../../lib/refreshTokens';

export async function POST(request) {
  const res = NextResponse.json({ ok: true });

  // Clear custom JWT session
  res.cookies.delete(sessionCookieName());
  const refreshToken = request.cookies.get(refreshCookieName())?.value;
  res.cookies.delete(refreshCookieName());
  res.cookies.delete('role');
  res.cookies.delete('email');

  // Clear NextAuth session cookies
  res.cookies.delete('authjs.session-token');
  res.cookies.delete('authjs.callback-url');
  res.cookies.delete('authjs.csrf-token');
  res.cookies.delete('__Secure-authjs.session-token');
  res.cookies.delete('__Host-authjs.csrf-token');

  if (refreshToken) {
    await revokeRefreshToken(refreshToken);
  }

  return res;
}
