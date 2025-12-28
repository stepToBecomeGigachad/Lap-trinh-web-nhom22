import { NextResponse } from 'next/server';
import { parseSession, sessionCookieName } from '../lib/auth';

/**
 * Parse session from request cookies
 */
export async function getSession(request) {
    const token = request.cookies.get(sessionCookieName())?.value;
    return await parseSession(token);
}

/**
 * Check if user is logged in
 */
export function isAuthenticated(session) {
    return !!session?.id || !!session?.email;
}

/**
 * Check if user is admin
 */
export function isAdmin(session) {
    // Support both lowercase 'admin' and uppercase 'ADMIN'
    return session?.role?.toLowerCase() === 'admin';
}

/**
 * Admin routes protection middleware
 * Redirects to login if not authenticated, to forbidden if not admin
 */
export function checkAdminAccess(request, session) {
    const { pathname } = request.nextUrl;

    // Check if it's an admin route
    const isAdminRoute = pathname === '/admin' ||
        pathname.startsWith('/admin/') ||
        pathname === '/manage' ||
        pathname.startsWith('/manage/');

    if (!isAdminRoute) return null;

    // Debug log
    console.log('[AUTH] Admin route check:', { pathname, session: session ? { email: session.email, role: session.role } : null });

    if (!isAuthenticated(session)) {
        console.log('[AUTH] Not authenticated, redirecting to login');
        const url = new URL('/login', request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    if (!isAdmin(session)) {
        console.log('[AUTH] Not admin, redirecting to forbidden. Role:', session?.role);
        return NextResponse.redirect(new URL('/forbidden', request.url));
    }

    console.log('[AUTH] Admin access granted');
    return null; // Access granted
}

/**
 * Admin API protection middleware
 * Returns 403 JSON if not admin
 */
export function checkAdminApiAccess(request, session) {
    const { pathname } = request.nextUrl;

    if (!pathname.startsWith('/api/admin')) return null;

    if (!isAdmin(session)) {
        return NextResponse.json(
            { ok: false, error: 'Không có quyền truy cập' },
            { status: 403 }
        );
    }

    return null;
}

/**
 * Protected user routes middleware
 * Redirects to login if not authenticated
 */
export function checkUserAccess(request, session) {
    const { pathname } = request.nextUrl;

    const protectedRoutes = ['/checkout', '/orders', '/personal', '/account'];
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    );

    if (!isProtectedRoute) return null;

    if (!isAuthenticated(session)) {
        const url = new URL('/login', request.url);
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
    }

    return null;
}

/**
 * Protected API routes middleware
 * Returns 401 JSON if not authenticated
 */
export function checkUserApiAccess(request, session) {
    const { pathname } = request.nextUrl;

    const protectedApiRoutes = ['/api/orders', '/api/profile', '/api/account'];
    const isProtectedApi = protectedApiRoutes.some(route =>
        pathname === route || pathname.startsWith(route + '/')
    );

    if (!isProtectedApi) return null;

    if (!isAuthenticated(session)) {
        return NextResponse.json(
            { ok: false, error: 'Vui lòng đăng nhập' },
            { status: 401 }
        );
    }

    return null;
}
