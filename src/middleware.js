import { NextResponse } from 'next/server';
import { parseSession, sessionCookieName } from './lib/auth';
import { addSecurityHeaders, checkCsrf, validateRequestBody } from './middleware/security';

// Rate limiting store (in-memory, use Redis in production)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMITS = { DEFAULT: 100, LOGIN: 5, REGISTER: 3, REFRESH: 10 };
const APP_MODE = process.env.APP_MODE || 'web';
const API_PROXY_URL = process.env.API_PROXY_URL || '';

function getRateLimit(pathname) {
  if (pathname === '/api/login') return RATE_LIMITS.LOGIN;
  if (pathname === '/api/register') return RATE_LIMITS.REGISTER;
  if (pathname === '/api/auth/refresh') return RATE_LIMITS.REFRESH;
  return RATE_LIMITS.DEFAULT;
}

function checkRateLimit(request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') || 'unknown';
  const pathname = request.nextUrl.pathname;
  const key = `${ip}:${pathname}`;
  const now = Date.now();
  const limit = getRateLimit(pathname);

  const record = rateLimitStore.get(key);
  if (!record || now - record.start > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(key, { count: 1, start: now });
    return null;
  }

  record.count++;
  if (record.count > limit) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  return null;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  console.log('[MIDDLEWARE] Request:', pathname);

  if (APP_MODE === 'api' && !pathname.startsWith('/api')) {
    if (pathname === '/' && request.method === 'GET') {
      return NextResponse.redirect(new URL('/api', request.url));
    }
    return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  }

  if (APP_MODE === 'web' && API_PROXY_URL && pathname.startsWith('/api')) {
    const target = new URL(API_PROXY_URL);
    const url = new URL(request.url);
    url.protocol = target.protocol;
    url.host = target.host;
    return NextResponse.rewrite(url);
  }

  // Skip NextAuth routes (let NextAuth handle them)
  if (pathname.startsWith('/api/auth')) {
    const customAuthRoutes = new Set([
      '/api/auth/refresh',
      '/api/auth/forgot-password',
      '/api/auth/reset-password',
      '/api/auth/sync-session',
    ]);
    if (!customAuthRoutes.has(pathname)) {
      return NextResponse.next();
    }
  }

  // 1. Rate limiting
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  // 2. CSRF protection for state-changing requests
  const csrfResponse = checkCsrf(request);
  if (csrfResponse) return csrfResponse;

  // 3. Basic SQLi detection for JSON payloads
  const bodyValidation = await validateRequestBody(request);
  if (bodyValidation) return bodyValidation;

  // 2. Get session from cookie
  const token = request.cookies.get(sessionCookieName())?.value;
  const session = await parseSession(token);

  console.log('[MIDDLEWARE] Session:', session ? { email: session.email, role: session.role } : null);

  // 3. Admin routes protection (/admin, /manage)
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/') ||
    pathname === '/manage' || pathname.startsWith('/manage/');

  if (isAdminRoute) {
    if (!session?.email) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      console.log('[MIDDLEWARE] Not authenticated, redirecting to login');
      return NextResponse.redirect(url);
    }

    const isAdmin = session?.role?.toLowerCase() === 'admin';
    if (!isAdmin) {
      console.log('[MIDDLEWARE] Not admin (role:', session?.role, '), redirecting to forbidden');
      return NextResponse.redirect(new URL('/forbidden', request.url));
    }
    console.log('[MIDDLEWARE] Admin access granted');
  }

  // 4. Admin API protection
  if (pathname.startsWith('/api/admin')) {
    const isAdmin = session?.role?.toLowerCase() === 'admin';
    if (!isAdmin) {
      return NextResponse.json({ ok: false, error: 'Không có quyền truy cập' }, { status: 403 });
    }
  }

  // 5. User routes protection
  const protectedRoutes = ['/checkout', '/orders', '/personal', '/account'];
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isProtectedRoute && !session?.email) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // 6. User API protection
  const protectedApiRoutes = ['/api/orders', '/api/profile', '/api/account'];
  const isProtectedApi = protectedApiRoutes.some(route =>
    pathname === route || pathname.startsWith(route + '/')
  );

  if (isProtectedApi && !session?.email) {
    return NextResponse.json({ ok: false, error: 'Vui lòng đăng nhập' }, { status: 401 });
  }

  // 7. Add security headers
  const response = NextResponse.next();
  addSecurityHeaders(response);
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'self'; base-uri 'self'; form-action 'self'"
  );

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
