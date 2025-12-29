import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import {
  accessTokenMaxAgeSeconds,
  createSession,
  refreshCookieName,
  refreshTokenMaxAgeSeconds,
  sessionCookieName,
} from '../../../../lib/auth';
import {
  createRefreshToken,
  hashToken,
  storeRefreshToken,
  verifyRefreshToken,
} from '../../../../lib/refreshTokens';

export async function POST(request) {
  const refreshToken = request.cookies.get(refreshCookieName())?.value;
  if (!refreshToken) {
    return NextResponse.json({ ok: false, error: 'Missing refresh token' }, { status: 401 });
  }

  let payload;
  try {
    payload = await verifyRefreshToken(refreshToken);
  } catch {
    const res = NextResponse.json({ ok: false, error: 'Invalid refresh token' }, { status: 401 });
    res.cookies.delete(sessionCookieName());
    res.cookies.delete(refreshCookieName());
    return res;
  }

  const tokenHash = hashToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!stored || stored.revokedAt || stored.expiresAt <= new Date()) {
    const res = NextResponse.json({ ok: false, error: 'Expired refresh token' }, { status: 401 });
    res.cookies.delete(sessionCookieName());
    res.cookies.delete(refreshCookieName());
    return res;
  }

  let sessionPayload = {
    id: payload.id || payload.sub || stored.userId || null,
    email: payload.email || '',
    role: payload.role || 'user',
    name: payload.name || '',
  };

  if (stored.userId) {
    const user = await prisma.user.findUnique({
      where: { id: stored.userId },
      select: { id: true, email: true, name: true, role: true },
    });
    if (user) {
      sessionPayload = {
        id: user.id,
        email: user.email,
        role: user.role === 'ADMIN' ? 'admin' : 'user',
        name: user.name || '',
      };
    }
  }

  if (!sessionPayload.email) {
    const res = NextResponse.json({ ok: false, error: 'Invalid session' }, { status: 401 });
    res.cookies.delete(sessionCookieName());
    res.cookies.delete(refreshCookieName());
    return res;
  }

  const newAccessToken = await createSession(sessionPayload);
  const newRefresh = await createRefreshToken(sessionPayload);

  await prisma.refreshToken.update({
    where: { tokenHash },
    data: { revokedAt: new Date() },
  });

  await storeRefreshToken({
    token: newRefresh.token,
    userId: stored.userId || null,
    expiresAt: newRefresh.expiresAt,
  });

  const res = NextResponse.json({ ok: true });
  res.cookies.set(sessionCookieName(), newAccessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: accessTokenMaxAgeSeconds(),
  });
  res.cookies.set(refreshCookieName(), newRefresh.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: refreshTokenMaxAgeSeconds(),
  });
  return res;
}
