import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET(_req, { params }) {
  const { id } = params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, name: true } },
      items: { include: { product: { select: { slug: true, name: true } } } },
    },
  });
  if (!order) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, order });
}

export async function PUT(request, { params }) {
  const { id } = params;
  const body = await request.json().catch(() => ({}));
  const status = body?.status;
  if (!status) return NextResponse.json({ ok: false, error: 'Missing status' }, { status: 400 });
  await prisma.order.update({ where: { id }, data: { status } });
  return NextResponse.json({ ok: true });
}
