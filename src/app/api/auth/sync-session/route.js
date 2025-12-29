import { NextResponse } from 'next/server';
import {
    accessTokenMaxAgeSeconds,
    createSession,
    refreshCookieName,
    refreshTokenMaxAgeSeconds,
    sessionCookieName,
} from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';
import { createRefreshToken, storeRefreshToken } from '../../../../lib/refreshTokens';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, name, role } = body;

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        // Get user from database to get the actual role
        let userRole = role || 'user';
        let userId = null;

        try {
            const dbUser = await prisma.user.findUnique({
                where: { email },
                select: { id: true, role: true },
            });
            if (dbUser) {
                userId = dbUser.id;
                userRole = dbUser.role === 'ADMIN' ? 'admin' : 'user';
            }
        } catch (e) {
            console.error('Error fetching user from DB:', e);
        }

        // Create custom JWT session
        const token = await createSession({
            id: userId,
            email,
            name: name || '',
            role: userRole,
        });
        const refresh = await createRefreshToken({
            id: userId,
            email,
            name: name || '',
            role: userRole,
        });
        await storeRefreshToken({ token: refresh.token, userId: userId || null, expiresAt: refresh.expiresAt });

        const res = NextResponse.json({ ok: true });

        // Set custom JWT cookie
        res.cookies.set(sessionCookieName(), token, {
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

        // Also set role cookie for middleware
        res.cookies.set('role', userRole, {
            httpOnly: false,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: accessTokenMaxAgeSeconds(),
        });

        return res;
    } catch (error) {
        console.error('Sync session error:', error);
        return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }
}
