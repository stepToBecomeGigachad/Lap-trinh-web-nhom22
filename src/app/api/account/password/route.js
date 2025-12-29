import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { parseSession, sessionCookieName } from '../../../../lib/auth';
import { verifyPassword, hashPassword } from '../../../../lib/password';

export async function POST(request) {
  const token = request.cookies.get(sessionCookieName())?.value;
  const sess = await parseSession(token);
  if (!sess?.email) return NextResponse.json({ ok:false, error:'Unauthorized' }, { status:401 });

  const { currentPassword, newPassword } = await request.json().catch(()=>({}));
  if (!currentPassword || !newPassword) return NextResponse.json({ ok:false, error:'Missing fields' }, { status:400 });
  if (String(newPassword).length < 6) return NextResponse.json({ ok:false, error:'Mật khẩu mới phải từ 6 ký tự' }, { status:400 });

  const user = await prisma.user.findUnique({ where: { email: sess.email } });
  if (!user) return NextResponse.json({ ok:false, error:'Not found' }, { status:404 });

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASS = process.env.ADMIN_PASSWORD;
  const isScryptHash = String(user.passwordHash || '').startsWith('scrypt:');
  const isAdminCredentials =
    ADMIN_EMAIL &&
    ADMIN_PASS &&
    user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    currentPassword === ADMIN_PASS;
  const ok = verifyPassword(currentPassword, user.passwordHash) || (isAdminCredentials && !isScryptHash);
  if (!ok) return NextResponse.json({ ok:false, error:'Mật khẩu hiện tại không đúng' }, { status:403 });

  const passwordHash = hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { passwordHash } }),
    prisma.refreshToken.updateMany({ where: { userId: user.id }, data: { revokedAt: new Date() } }),
  ]);
  return NextResponse.json({ ok:true });
}
