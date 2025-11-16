import { NextResponse } from 'next/server';
import { sessionCookieName } from '../../../lib/auth';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(sessionCookieName());
  res.cookies.delete('role');
  res.cookies.delete('email');
  return res;
}
