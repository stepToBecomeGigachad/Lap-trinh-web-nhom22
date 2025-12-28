import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '20', 10);
  const where = q ? { name: { contains: q } } : {};
  const total = await prisma.product.count({ where });
  const rows = await prisma.product.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * pageSize,
    take: pageSize,
    select: {
      id: true, slug: true, name: true, price: true, salePrice: true, brand: true,
      category: { select: { slug: true } },
      images: { take: 1, select: { url: true } },
      stock: true,
    }
  });
  const items = rows.map(r => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    price: r.price,
    salePrice: r.salePrice,
    brand: r.brand,
    stock: r.stock,
    category: r.category?.slug || null,
    image: r.images?.[0]?.url || null,
  }));
  return NextResponse.json({ ok: true, items, total, page, pageSize });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { slug, name, description = '', price, salePrice, brand, stock = 0, categorySlug, image } = body || {};
    if (!slug || !name || price == null || !categorySlug) {
      return NextResponse.json({ ok: false, error: 'Vui lòng điền đầy đủ thông tin' }, { status: 400 });
    }

    // Check if slug already exists
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ ok: false, error: 'Slug đã tồn tại, vui lòng chọn slug khác' }, { status: 400 });
    }

    const cat = await prisma.category.upsert({
      where: { slug: categorySlug },
      update: {},
      create: { slug: categorySlug, name: categorySlug }
    });
    const created = await prisma.product.create({
      data: {
        slug, name, description, price: Number(price), salePrice: salePrice != null ? Number(salePrice) : null,
        brand: brand || null, stock: Number(stock) || 0, categoryId: cat.id,
        images: image ? { create: [{ url: image }] } : undefined,
      },
      select: { id: true }
    });
    return NextResponse.json({ ok: true, id: created.id });
  } catch (err) {
    console.error('Create product error:', err);
    return NextResponse.json({ ok: false, error: err.message || 'Server error' }, { status: 500 });
  }
}
