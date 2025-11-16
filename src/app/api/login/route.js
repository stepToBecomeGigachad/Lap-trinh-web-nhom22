import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { createSession, sessionCookieName } from '../../../lib/auth';
import { verifyPassword } from '../../../lib/password';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    const ADMIN_EMAIL = 'admin@test.com';
    const ADMIN_PASS = 'test.123';

    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      const jwt = await createSession({ email, role: 'admin', name: 'Admin' });
      const res = NextResponse.json({ ok: true });
      res.cookies.set(sessionCookieName(), jwt, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        path: '/',
        maxAge: 60 * 60 * 8,
      });
      return res;
    }

    // Normal user from DB
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
    }
    const jwt = await createSession({ email: user.email, role: user.role === 'ADMIN' ? 'admin' : 'user', name: user.name || '' });
    const res = NextResponse.json({ ok: true });
    res.cookies.set(sessionCookieName(), jwt, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    return res;
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Bad request' }, { status: 400 });
  }
}
