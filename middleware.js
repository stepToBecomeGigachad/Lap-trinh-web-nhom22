import { NextResponse } from 'next/server';
import { parseSession, sessionCookieName } from './src/lib/auth';

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(sessionCookieName())?.value;
  const session = await parseSession(token);
  const role = session?.role || '';

  // Protect Admin UI paths: /admin (static) and /manage (Next pages)
  if (pathname === '/admin' || pathname.startsWith('/admin/') || pathname === '/manage' || pathname.startsWith('/manage/')) {
    if (!role) {
      const url = new URL('/login', request.url);
      url.searchParams.set('redirect', pathname);
      return NextResponse.redirect(url);
    }

    if (role !== 'admin') {
      const url = new URL('/forbidden', request.url);
      return NextResponse.redirect(url);
    }
  }

  // API Admin guard: return JSON instead of redirect
  if (pathname.startsWith('/api/admin')) {
    if (role !== 'admin') {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/manage', '/manage/:path*', '/api/admin/:path*'],
};
