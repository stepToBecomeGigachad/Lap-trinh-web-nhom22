import { NextResponse } from 'next/server';
import { parseSession, sessionCookieName } from '../../../lib/auth';

export async function GET(request) {
  const token = request.cookies.get(sessionCookieName())?.value;
  const payload = await parseSession(token);
  if (!payload) return NextResponse.json({ loggedIn: false });
  const { email = '', role = 'user', name = '' } = payload;
  return NextResponse.json({ loggedIn: true, email, role, name, profile: { name } });
}
