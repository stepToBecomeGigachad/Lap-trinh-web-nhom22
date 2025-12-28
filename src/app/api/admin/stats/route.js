import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

function startOfDay(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function startOfWeek(d) {
  const x = startOfDay(d);
  const day = x.getDay(); // 0 Sun
  const diff = (day + 6) % 7; // Monday as start
  x.setDate(x.getDate() - diff);
  return x;
}
function startOfMonth(d) { const x = startOfDay(d); x.setDate(1); return x; }

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') || 'summary';

  const now = new Date();
  const sd = startOfDay(now);
  const sw = startOfWeek(now);
  const sm = startOfMonth(now);

  const whereDelivered = { status: 'DELIVERED' };

  if (mode === 'dashboard') {
    // Get dashboard stats
    const [dayRevenue, weekRevenue, monthRevenue, totalOrders, pendingOrders, totalProducts, totalUsers, recentOrders, topProducts, dailyRevenue] = await Promise.all([
      prisma.order.aggregate({ _sum: { total: true }, where: { ...whereDelivered, createdAt: { gte: sd } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { ...whereDelivered, createdAt: { gte: sw } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { ...whereDelivered, createdAt: { gte: sm } } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.product.count(),
      prisma.user.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, status: true, total: true, createdAt: true, shippingName: true }
      }),
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5
      }),
      // Get revenue for last 7 days
      prisma.order.findMany({
        where: {
          ...whereDelivered,
          createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
        },
        select: { total: true, createdAt: true }
      })
    ]);

    // Get product names for top products
    const productIds = topProducts.map(p => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true }
    });

    const topProductsWithNames = topProducts.map(p => {
      const product = products.find(pr => pr.id === p.productId);
      return {
        id: p.productId,
        name: product?.name || 'Unknown',
        price: product?.price || 0,
        quantity: p._sum.quantity
      };
    });

    // Aggregate daily revenue
    const dailyRevenueMap = {};
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      dailyRevenueMap[key] = 0;
    }

    dailyRevenue.forEach(order => {
      const key = new Date(order.createdAt).toISOString().split('T')[0];
      if (dailyRevenueMap[key] !== undefined) {
        dailyRevenueMap[key] += order.total;
      }
    });

    const chartData = Object.entries(dailyRevenueMap).map(([date, total]) => ({
      date,
      revenue: total,
      label: new Date(date).toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'numeric' })
    }));

    return NextResponse.json({
      ok: true,
      today: dayRevenue._sum.total || 0,
      week: weekRevenue._sum.total || 0,
      month: monthRevenue._sum.total || 0,
      totalOrders,
      pendingOrders,
      totalProducts,
      totalUsers,
      recentOrders,
      topProducts: topProductsWithNames,
      chartData
    });
  }

  // Default summary mode (backward compatible)
  const [day, week, month] = await Promise.all([
    prisma.order.aggregate({ _sum: { total: true }, where: { ...whereDelivered, createdAt: { gte: sd } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { ...whereDelivered, createdAt: { gte: sw } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { ...whereDelivered, createdAt: { gte: sm } } }),
  ]);

  return NextResponse.json({ ok: true, today: day._sum.total || 0, week: week._sum.total || 0, month: month._sum.total || 0 });
}

