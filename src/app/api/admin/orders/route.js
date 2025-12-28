import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { logger } from '../../../../lib/logger';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;

  // Validate status if provided
  const validStatuses = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
  if (status && !validStatuses.includes(status.toUpperCase())) {
    return NextResponse.json({ ok: false, error: 'Invalid status' }, { status: 400 });
  }

  const items = await prisma.order.findMany({
    where: status ? { status: status.toUpperCase() } : {},
    orderBy: { createdAt: 'desc' },
    take: 100,
    select: { id: true, status: true, total: true, createdAt: true, shippingName: true },
  });

  logger.info('Admin orders list fetched', { count: items.length, statusFilter: status });
  return NextResponse.json({ ok: true, items });
}

