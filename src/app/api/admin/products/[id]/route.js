import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET(_req, { params }) {
  const { id } = params;
  const p = await prisma.product.findUnique({ where: { id }, include: { category: true, images: true } });
  if (!p) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ok: true, product: p });
}

export async function PUT(request, { params }) {
  const { id } = params;
  const body = await request.json().catch(() => ({}));
  const data = {};
  for (const k of ['name','description','brand']) if (body[k] != null) data[k] = body[k];
  if (body.price != null) data.price = Number(body.price);
  if (body.salePrice !== undefined) data.salePrice = body.salePrice == null ? null : Number(body.salePrice);
  if (body.stock != null) data.stock = Number(body.stock);
  if (body.categorySlug) {
    const cat = await prisma.category.upsert({ where: { slug: body.categorySlug }, update: {}, create: { slug: body.categorySlug, name: body.categorySlug } });
    data.categoryId = cat.id;
  }
  await prisma.product.update({ where: { id }, data });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req, { params }) {
  const { id } = params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

