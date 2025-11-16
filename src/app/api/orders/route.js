import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { parseSession, sessionCookieName } from '../../../lib/auth';

export async function GET(request) {
  const token = request.cookies.get(sessionCookieName())?.value;
  const sess = await parseSession(token);
  if (!sess?.email) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  // Find or create user for linking orders
  const user = await prisma.user.upsert({
    where: { email: sess.email },
    update: { name: sess.name ?? '' },
    create: { email: sess.email, name: sess.name ?? '', passwordHash: '', role: sess.role === 'admin' ? 'ADMIN' : 'USER' },
  });

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, status: true, total: true, createdAt: true },
  });
  return NextResponse.json({ ok: true, items: orders });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, shipping } = body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: false, error: 'Empty items' }, { status: 400 });
    }
    for (const f of ['name','phone','address','city','district']) {
      if (!shipping?.[f]) return NextResponse.json({ ok: false, error: 'Missing shipping info' }, { status: 400 });
    }

    // items format: [{ slug, quantity }]
    const slugs = items.map(i => i.slug);
    const dbProducts = await prisma.product.findMany({ where: { slug: { in: slugs } }, select: { id: true, slug: true, price: true, salePrice: true } });
    if (dbProducts.length !== slugs.length) return NextResponse.json({ ok: false, error: 'Some products not found' }, { status: 400 });

    const priceBySlug = Object.fromEntries(dbProducts.map(p => [p.slug, p.salePrice ?? p.price]));
    const idBySlug = Object.fromEntries(dbProducts.map(p => [p.slug, p.id]));
    const total = items.reduce((t, it) => t + (priceBySlug[it.slug] || 0) * (it.quantity || 1), 0);

    const token = request.cookies.get(sessionCookieName())?.value;
    const sess = await parseSession(token);
    let userId = null;
    if (sess?.email) {
      const user = await prisma.user.upsert({
        where: { email: sess.email },
        update: { name: sess.name ?? '' },
        create: { email: sess.email, name: sess.name ?? '', passwordHash: '', role: sess.role === 'admin' ? 'ADMIN' : 'USER' },
      });
      userId = user.id;
    }

    const created = await prisma.order.create({
      data: {
        userId,
        status: 'PENDING',
        total,
        shippingName: shipping.name,
        phone: shipping.phone,
        address: shipping.address,
        city: shipping.city,
        district: shipping.district,
        items: {
          create: items.map(it => ({
            productId: idBySlug[it.slug],
            quantity: it.quantity || 1,
            priceAtOrder: priceBySlug[it.slug] || 0,
          })),
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: created.id, total });
  } catch {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}

