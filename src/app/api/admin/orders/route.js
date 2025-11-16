import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  const items = await prisma.order.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: { id: true, status: true, total: true, createdAt: true, shippingName: true },
  });
  return NextResponse.json({ ok: true, items });
}

