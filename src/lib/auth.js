import { SignJWT, jwtVerify } from 'jose';

const SESSION_COOKIE = 'session';
const REFRESH_COOKIE = 'refresh_token';
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '8h';
const REFRESH_TOKEN_TTL = process.env.REFRESH_TOKEN_TTL || '30d';
const JWT_ISSUER = process.env.JWT_ISSUER;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE;

function getSecret() {
  const secret = process.env.SESSION_SECRET || 'dev-insecure-secret-change-me';
  return new TextEncoder().encode(secret);
}

export function durationToSeconds(value) {
  if (!value) return 0;
  const match = String(value).trim().match(/^(\d+)([smhd])?$/i);
  if (!match) return 0;
  const amount = Number(match[1]);
  const unit = (match[2] || 's').toLowerCase();
  const scale = { s: 1, m: 60, h: 3600, d: 86400 }[unit] || 1;
  return amount * scale;
}

export function accessTokenTtl() { return ACCESS_TOKEN_TTL; }
export function refreshTokenTtl() { return REFRESH_TOKEN_TTL; }

export function accessTokenMaxAgeSeconds() {
  return durationToSeconds(ACCESS_TOKEN_TTL) || 8 * 60 * 60;
}

export function refreshTokenMaxAgeSeconds() {
  return durationToSeconds(REFRESH_TOKEN_TTL) || 30 * 24 * 60 * 60;
}

export async function createAccessToken(payload) {
  let builder = new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(accessTokenTtl());
  if (JWT_ISSUER) builder = builder.setIssuer(JWT_ISSUER);
  if (JWT_AUDIENCE) builder = builder.setAudience(JWT_AUDIENCE);
  const token = await builder.sign(getSecret());
  return token;
}

export async function createSession(payload) {
  return createAccessToken(payload);
}

export async function parseSession(token) {
  if (!token) return null;
  try {
    const options = {};
    if (JWT_ISSUER) options.issuer = JWT_ISSUER;
    if (JWT_AUDIENCE) options.audience = JWT_AUDIENCE;
    const { payload } = await jwtVerify(token, getSecret(), options);
    return payload;
  } catch {
    return null;
  }
}

export function sessionCookieName() { return SESSION_COOKIE; }
export function refreshCookieName() { return REFRESH_COOKIE; }
