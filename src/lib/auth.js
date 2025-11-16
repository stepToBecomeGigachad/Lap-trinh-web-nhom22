import { SignJWT, jwtVerify } from 'jose';

const SESSION_COOKIE = 'session';

function getSecret() {
  const secret = process.env.SESSION_SECRET || 'dev-insecure-secret-change-me';
  return new TextEncoder().encode(secret);
}

export async function createSession(payload) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('8h')
    .sign(getSecret());
  return token;
}

export async function parseSession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieName() { return SESSION_COOKIE; }

