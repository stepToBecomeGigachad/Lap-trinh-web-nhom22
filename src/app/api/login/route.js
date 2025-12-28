import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { createSession, sessionCookieName } from '../../../lib/auth';
import { verifyPassword } from '../../../lib/password';
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

    // Check hardcoded admin (for development only - should be removed in production)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@test.com';
    const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'Test.123';

    if (normalizedEmail === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASS) {
      const jwt = await createSession({ id: 'admin', email: ADMIN_EMAIL, role: 'admin', name: 'Admin' });
      const res = NextResponse.json({ ok: true });
      res.cookies.set(sessionCookieName(), jwt, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 8,
      });
      return res;
    }

    // Normal user from DB
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Use constant-time comparison to prevent timing attacks
    if (!user || !verifyPassword(password, user.passwordHash)) {
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

    const res = NextResponse.json({ ok: true });
    res.cookies.set(sessionCookieName(), jwt, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    return res;
  } catch (e) {
    console.error('Login error:', e);
    return NextResponse.json({ ok: false, error: 'Có lỗi xảy ra' }, { status: 400 });
  }
}
