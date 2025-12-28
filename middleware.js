import { NextResponse } from 'next/server';

export function middleware(request) {
  console.log('[MIDDLEWARE] Test:', request.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ['/manage/:path*'],
};
