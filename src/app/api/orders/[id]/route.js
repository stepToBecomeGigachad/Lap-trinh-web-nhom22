import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { parseSession, sessionCookieName } from '../../../../lib/auth';

async function getUserIdFromSession(cookies) {
  const token = cookies.get(sessionCookieName())?.value;
  const sess = await parseSession(token);
  if (!sess?.email) return { userId: null, role: 'guest' };
  const user = await prisma.user.upsert({
    where: { email: sess.email },
    update: { name: sess.name ?? '' },
    create: { email: sess.email, name: sess.name ?? '', passwordHash: '', role: sess.role === 'admin' ? 'ADMIN' : 'USER' },
  });
  return { userId: user.id, role: sess.role || 'user' };
}

export async function GET(request, { params }) {
  const { id } = params;
  const { userId, role } = await getUserIdFromSession(request.cookies);
  const where = role === 'admin' ? { id } : { id, userId: userId || undefined };
  const order = await prisma.order.findFirst({
    where,
    include: {
      items: {
        include: {
          product: { select: { slug: true, name: true, images: { take: 1, select: { url: true } } } },
        },
      },
    },
  });
  if (!order) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, order });
}

export async function POST(request, { params }) {
  const { id } = params;
  const body = await request.json().catch(() => ({}));
  const action = body?.action;
  const { userId, role } = await getUserIdFromSession(request.cookies);

  if (action === 'cancel') {
    const where = role === 'admin' ? { id, status: 'PENDING' } : { id, userId: userId || undefined, status: 'PENDING' };
    const found = await prisma.order.findFirst({ where, select: { id: true } });
    if (!found) return NextResponse.json({ ok: false, error: 'Cannot cancel' }, { status: 400 });
    await prisma.order.update({ where: { id }, data: { status: 'CANCELLED' } });
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: 'Unsupported action' }, { status: 400 });
}
