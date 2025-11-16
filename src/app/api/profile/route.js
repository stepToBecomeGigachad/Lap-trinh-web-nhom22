import { NextResponse } from 'next/server';
import { parseSession, createSession, sessionCookieName } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

export async function GET(request) {
  const token = request.cookies.get(sessionCookieName())?.value;
  const payload = await parseSession(token);
  if (!payload) return NextResponse.json({ ok: false }, { status: 401 });
  const { role = 'user', email = '', name = '', phone = '' } = payload;
  return NextResponse.json({ ok: true, role, email, profile: { name, phone } });
}

export async function POST(request) {
  const token = request.cookies.get(sessionCookieName())?.value;
  const payload = await parseSession(token);
  if (!payload) return NextResponse.json({ ok: false }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const name = body?.name || payload.name || '';
  const phone = body?.phone || payload.phone || '';

  // Persist name to DB if user exists
  try {
    if (payload.email) {
      await prisma.user.update({ where: { email: payload.email }, data: { name } });
    }
  } catch {}

  const newToken = await createSession({ ...payload, name, phone });
  const res = NextResponse.json({ ok: true, email: payload.email, role: payload.role, profile: { name, phone } });
  res.cookies.set(sessionCookieName(), newToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 60 * 60 * 8,
  });
  return res;
}
