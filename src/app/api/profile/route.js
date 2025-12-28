import { NextResponse } from 'next/server';
import { parseSession, createSession, sessionCookieName } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

export async function GET(request) {
  // Check custom JWT session (works for both normal login and synced Google login)
  const token = request.cookies.get(sessionCookieName())?.value;
  const payload = await parseSession(token);

  if (payload) {
    const { role = 'user', email = '', name = '', phone = '' } = payload;

    // Get phone from database if not in session
    let userPhone = phone;
    if (!userPhone && email) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: { phone: true }
        });
        userPhone = dbUser?.phone || '';
      } catch { }
    }

    return NextResponse.json({ ok: true, role, email, profile: { name, phone: userPhone } });
  }

  return NextResponse.json({ ok: false }, { status: 401 });
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  // Check custom JWT session
  const token = request.cookies.get(sessionCookieName())?.value;
  const payload = await parseSession(token);

  if (payload) {
    const name = body?.name || payload.name || '';
    const phone = body?.phone || payload.phone || '';

    // Persist to DB if user exists
    try {
      if (payload.email) {
        await prisma.user.update({ where: { email: payload.email }, data: { name, phone } });
      }
    } catch { }

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

  return NextResponse.json({ ok: false }, { status: 401 });
}
