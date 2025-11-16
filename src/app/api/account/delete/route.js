import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { parseSession, sessionCookieName } from '../../../../lib/auth';
import { verifyPassword } from '../../../../lib/password';

export async function POST(request) {
  const token = request.cookies.get(sessionCookieName())?.value;
  const sess = await parseSession(token);
  if (!sess?.email) return NextResponse.json({ ok:false, error:'Unauthorized' }, { status:401 });

  const { password } = await request.json().catch(()=>({}));
  if (!password) return NextResponse.json({ ok:false, error:'Missing password' }, { status:400 });

  const user = await prisma.user.findUnique({ where: { email: sess.email } });
  if (!user) return NextResponse.json({ ok:false, error:'Not found' }, { status:404 });
  if (!verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ ok:false, error:'Invalid password' }, { status:403 });
  }

  await prisma.user.delete({ where: { id: user.id } });
  const res = NextResponse.json({ ok:true });
  // Clear session cookie
  res.cookies.set(sessionCookieName(), '', { httpOnly:true, path:'/', maxAge:0 });
  return res;
}

