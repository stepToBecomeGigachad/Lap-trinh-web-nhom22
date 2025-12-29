import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import {
  accessTokenMaxAgeSeconds,
  createSession,
  refreshCookieName,
  refreshTokenMaxAgeSeconds,
  sessionCookieName,
} from '../../../lib/auth';
import { hashPassword } from '../../../lib/password';
import { validatePassword, validateEmail } from '../../../middleware/passwordPolicy';
import { createRefreshToken, storeRefreshToken } from '../../../lib/refreshTokens';

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json({ ok: false, error: emailValidation.error }, { status: 400 });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json({
        ok: false,
        error: passwordValidation.errors[0],
        errors: passwordValidation.errors
      }, { status: 400 });
    }

    const displayName = (name || email.split('@')[0]).trim();

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (existing) {
      return NextResponse.json({ ok: false, error: 'Email đã tồn tại' }, { status: 409 });
    }

    const passwordHash = hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: displayName,
        passwordHash,
        role: 'USER'
      }
    });

    const jwt = await createSession({ id: user.id, email: user.email, role: 'user', name: displayName });
    const refresh = await createRefreshToken({ id: user.id, email: user.email, role: 'user', name: displayName });
    await storeRefreshToken({ token: refresh.token, userId: user.id, expiresAt: refresh.expiresAt });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(sessionCookieName(), jwt, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: accessTokenMaxAgeSeconds(),
    });
    res.cookies.set(refreshCookieName(), refresh.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: refreshTokenMaxAgeSeconds(),
    });
    return res;
  } catch (e) {
    console.error('Register error:', e);
    return NextResponse.json({ ok: false, error: 'Có lỗi xảy ra' }, { status: 400 });
  }
}
