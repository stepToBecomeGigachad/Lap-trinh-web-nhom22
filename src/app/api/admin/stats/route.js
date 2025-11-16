import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

function startOfDay(d) { const x = new Date(d); x.setHours(0,0,0,0); return x; }
function startOfWeek(d) {
  const x = startOfDay(d);
  const day = x.getDay(); // 0 Sun
  const diff = (day + 6) % 7; // Monday as start
  x.setDate(x.getDate() - diff);
  return x;
}
function startOfMonth(d) { const x = startOfDay(d); x.setDate(1); return x; }

export async function GET() {
  const now = new Date();
  const sd = startOfDay(now);
  const sw = startOfWeek(now);
  const sm = startOfMonth(now);

  const whereDelivered = { status: 'DELIVERED' };

  const [day, week, month] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: { ...whereDelivered, createdAt: { gte: sd } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { ...whereDelivered, createdAt: { gte: sw } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { ...whereDelivered, createdAt: { gte: sm } } }),
  ]);

  return NextResponse.json({ ok: true, today: day._sum.total || 0, week: week._sum.total || 0, month: month._sum.total || 0 });
}

