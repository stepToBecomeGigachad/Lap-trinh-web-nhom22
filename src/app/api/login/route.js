import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import {
  accessTokenMaxAgeSeconds,
  createSession,
  refreshCookieName,
  refreshTokenMaxAgeSeconds,
  sessionCookieName,
} from '../../../lib/auth';
import { createRefreshToken, storeRefreshToken } from '../../../lib/refreshTokens';
import { hashPassword, verifyPassword } from '../../../lib/password';
import { validateEmail } from '../../../middleware/passwordPolicy';

// Generic error message to prevent user enumeration
const INVALID_CREDENTIALS_MSG = 'Email hoặc mật khẩu không đúng';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json({ ok: false, error: INVALID_CREDENTIALS_MSG }, { status: 401 });
    }

    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json({ ok: false, error: INVALID_CREDENTIALS_MSG }, { status: 401 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASS = process.env.ADMIN_PASSWORD;

    // Normal user from DB
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    const isAdminCredentials =
      ADMIN_EMAIL &&
      ADMIN_PASS &&
      normalizedEmail === ADMIN_EMAIL.toLowerCase() &&
      password === ADMIN_PASS;

    const isScryptHash = String(user?.passwordHash || '').startsWith('scrypt:');
    const isValidPassword = user ? verifyPassword(password, user.passwordHash) : false;

    // Allow admin legacy hash to be upgraded once using env credentials
    if (user && !isValidPassword && isAdminCredentials && !isScryptHash) {
      const upgradedHash = hashPassword(password);
      await prisma.user.update({ where: { id: user.id }, data: { passwordHash: upgradedHash, role: 'ADMIN' } });
    } else if (!user || !isValidPassword) {
      // Add small delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
      return NextResponse.json({ ok: false, error: INVALID_CREDENTIALS_MSG }, { status: 401 });
    }

    const jwt = await createSession({
      id: user.id,
      email: user.email,
      role: user.role === 'ADMIN' ? 'admin' : 'user',
      name: user.name || ''
    });
    const refresh = await createRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role === 'ADMIN' ? 'admin' : 'user',
      name: user.name || ''
    });
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
    console.error('Login error:', e);
    return NextResponse.json({ ok: false, error: 'Có lỗi xảy ra' }, { status: 400 });
  }
}
