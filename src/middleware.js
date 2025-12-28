import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Session config
const SESSION_COOKIE = 'session';

function getSecret() {
  const secret = process.env.SESSION_SECRET || 'dev-insecure-secret-change-me';
  return new TextEncoder().encode(secret);
}

async function parseSession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload;
  } catch {
    return null;
  }
}

// Rate limiting store (in-memory, use Redis in production)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000;
const RATE_LIMITS = { DEFAULT: 100, LOGIN: 5, REGISTER: 3 };

function getRateLimit(pathname) {
  if (pathname === '/api/login') return RATE_LIMITS.LOGIN;
  if (pathname === '/api/register') return RATE_LIMITS.REGISTER;
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

  // Skip NextAuth routes (let NextAuth handle them)
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // 1. Rate limiting
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  // 2. Get session from cookie
  const token = request.cookies.get(SESSION_COOKIE)?.value;
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
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/manage',
    '/manage/:path*',
    '/checkout',
    '/orders/:path*',
    '/personal',
    '/account/:path*',
    '/api/:path*',
  ],
};
