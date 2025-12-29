import crypto from 'crypto';
import { SignJWT, decodeJwt, jwtVerify } from 'jose';
import prisma from './prisma';
import { refreshTokenMaxAgeSeconds, refreshTokenTtl } from './auth';

const REFRESH_TYPE = 'refresh';
const JWT_ISSUER = process.env.JWT_ISSUER;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE;

function getRefreshSecret() {
  const secret = process.env.REFRESH_SECRET || process.env.SESSION_SECRET || 'dev-insecure-secret-change-me';
  return new TextEncoder().encode(secret);
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createRefreshToken(payload) {
  let builder = new SignJWT({ ...payload, type: REFRESH_TYPE })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(refreshTokenTtl())
    .setJti(crypto.randomUUID());
  if (JWT_ISSUER) builder = builder.setIssuer(JWT_ISSUER);
  if (JWT_AUDIENCE) builder = builder.setAudience(JWT_AUDIENCE);
  const token = await builder.sign(getRefreshSecret());

  const decoded = decodeJwt(token);
  const expiresAt = decoded.exp
    ? new Date(decoded.exp * 1000)
    : new Date(Date.now() + refreshTokenMaxAgeSeconds() * 1000);

  return { token, expiresAt };
}

export async function verifyRefreshToken(token) {
  const options = {};
  if (JWT_ISSUER) options.issuer = JWT_ISSUER;
  if (JWT_AUDIENCE) options.audience = JWT_AUDIENCE;
  const { payload } = await jwtVerify(token, getRefreshSecret(), options);
  if (payload.type !== REFRESH_TYPE) {
    throw new Error('Invalid refresh token');
  }
  return payload;
}

export async function storeRefreshToken({ token, userId, expiresAt }) {
  const tokenHash = hashToken(token);
  return prisma.refreshToken.create({
    data: {
      tokenHash,
      userId: userId || null,
      expiresAt,
    },
  });
}

export async function revokeRefreshToken(token) {
  const tokenHash = hashToken(token);
  return prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
