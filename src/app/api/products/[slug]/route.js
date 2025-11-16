import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

export async function GET(_req, { params }) {
  try {
    const { slug } = params;
    const p = await prisma.product.findUnique({
      where: { slug },
      include: { category: true, images: true },
    });
    if (!p) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });
    const item = {
      slug: p.slug,
      name: p.name,
      description: p.description,
      price: p.price,
      salePrice: p.salePrice,
      brand: p.brand,
      category: p.category?.slug || null,
      image: p.images?.[0]?.url || null,
      images: p.images?.map(i => ({ url: i.url, alt: i.alt })) || [],
    };
    return NextResponse.json(item);
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
