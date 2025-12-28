import { NextResponse } from 'next/server';
import { sessionCookieName } from '../../../lib/auth';

export async function POST() {
  const res = NextResponse.json({ ok: true });

  // Clear custom JWT session
  res.cookies.delete(sessionCookieName());
  res.cookies.delete('role');
  res.cookies.delete('email');

  // Clear NextAuth session cookies
  res.cookies.delete('authjs.session-token');
  res.cookies.delete('authjs.callback-url');
  res.cookies.delete('authjs.csrf-token');
  res.cookies.delete('__Secure-authjs.session-token');
  res.cookies.delete('__Host-authjs.csrf-token');

  return res;
}
