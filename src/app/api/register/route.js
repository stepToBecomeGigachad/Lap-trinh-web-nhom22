import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { createSession, sessionCookieName } from '../../../lib/auth';
import { hashPassword } from '../../../lib/password';

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Missing fields' }, { status: 400 });
    }

    const displayName = (name || email.split('@')[0]).trim();

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ ok: false, error: 'Email đã tồn tại' }, { status: 409 });
    }

    const passwordHash = hashPassword(password);
    await prisma.user.create({ data: { email, name: displayName, passwordHash, role: 'USER' } });

    const jwt = await createSession({ email, role: 'user', name: displayName });
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
