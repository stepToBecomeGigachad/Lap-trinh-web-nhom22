import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = (searchParams.get('q') || '').trim();
    const category = (searchParams.get('category') || '').trim();
    const priceMin = searchParams.get('priceMin');
    const priceMax = searchParams.get('priceMax');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '12', 10);

    const andWhere = [];
    if (q) andWhere.push({ name: { contains: q, mode: 'insensitive' } });
    if (category) andWhere.push({ category: { slug: category } });

    // Price filter: apply to salePrice if exists, otherwise price
    const min = priceMin ? Number(priceMin) : null;
    const max = priceMax ? Number(priceMax) : null;
    if (min !== null || max !== null) {
      const saleCond = {};
      const priceCond = {};
      if (min !== null) { saleCond.gte = min; priceCond.gte = min; }
      if (max !== null) { saleCond.lte = max; priceCond.lte = max; }
      andWhere.push({ OR: [ { salePrice: saleCond }, { salePrice: null, price: priceCond } ] });
    }

    const where = andWhere.length ? { AND: andWhere } : {};

    const total = await prisma.product.count({ where });
    const itemsDb = await prisma.product.findMany({
      where,
      include: { category: true, images: { take: 1 } },
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });

    const items = itemsDb.map(p => ({
      slug: p.slug,
      name: p.name,
      description: p.description,
      price: p.price,
      salePrice: p.salePrice,
      brand: p.brand,
      category: p.category?.slug || null,
      image: p.images?.[0]?.url || null,
    }));

    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    return NextResponse.json({ items, total, page, pageSize, totalPages });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
