import { NextResponse } from 'next/server';
import { parseSession, sessionCookieName } from '../../../lib/auth';

export async function GET(request) {
  // Check custom JWT session (works for both normal login and synced Google login)
  const token = request.cookies.get(sessionCookieName())?.value;
  const payload = await parseSession(token);

  if (payload) {
    const { email = '', role = 'user', name = '' } = payload;
    return NextResponse.json({ loggedIn: true, email, role, name, profile: { name } });
  }

  return NextResponse.json({ loggedIn: false });
}
