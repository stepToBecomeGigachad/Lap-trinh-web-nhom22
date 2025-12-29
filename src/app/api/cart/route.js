import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { parseSession, sessionCookieName } from '../../../lib/auth';
import { validateOrderItems, validateQuantity } from '../../../middleware/orderValidation';

const CART_TTL_DAYS = 7;
const CART_TTL_MS = CART_TTL_DAYS * 24 * 60 * 60 * 1000;

function toExpiresAt() {
  return new Date(Date.now() + CART_TTL_MS);
}

async function getUserFromSession(cookies) {
  const token = cookies.get(sessionCookieName())?.value;
  const sess = await parseSession(token);
  if (!sess?.email) return null;

  const user = await prisma.user.upsert({
    where: { email: sess.email },
    update: { name: sess.name ?? '' },
    create: {
      email: sess.email,
      name: sess.name ?? '',
      passwordHash: '',
      role: sess.role === 'admin' ? 'ADMIN' : 'USER',
    },
  });

  return user;
}

function serializeCart(cart) {
  return {
    id: cart.id,
    expiresAt: cart.expiresAt,
    updatedAt: cart.updatedAt,
    items: cart.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      priceAtSave: item.priceAtSave,
      product: item.product
        ? {
            id: item.product.id,
            slug: item.product.slug,
            name: item.product.name,
            price: item.product.price,
            salePrice: item.product.salePrice,
            image: item.product.images?.[0]?.url || '',
          }
        : null,
    })),
  };
}

export async function GET(request) {
  const user = await getUserFromSession(request.cookies);
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const cart = await prisma.savedCart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              name: true,
              price: true,
              salePrice: true,
              images: { take: 1, select: { url: true } },
            },
          },
        },
      },
    },
  });

  if (!cart) return NextResponse.json({ ok: true, cart: null });

  if (cart.expiresAt && cart.expiresAt < new Date()) {
    await prisma.savedCart.delete({ where: { id: cart.id } });
    return NextResponse.json({ ok: true, cart: null });
  }

  return NextResponse.json({ ok: true, cart: serializeCart(cart) });
}

export async function PUT(request) {
  const user = await getUserFromSession(request.cookies);
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const items = Array.isArray(body?.items) ? body.items : [];

  if (items.length === 0) {
    await prisma.savedCart.deleteMany({ where: { userId: user.id } });
    return NextResponse.json({ ok: true, cart: null });
  }

  const itemsValidation = validateOrderItems(items);
  if (!itemsValidation.valid) {
    return NextResponse.json({ ok: false, error: itemsValidation.error }, { status: 400 });
  }

  const normalizedItems = [];
  for (const item of items) {
    const qtyValidation = validateQuantity(item.quantity);
    if (!qtyValidation.valid) {
      return NextResponse.json({ ok: false, error: qtyValidation.error }, { status: 400 });
    }
    normalizedItems.push({ slug: String(item.slug), quantity: qtyValidation.value });
  }

  const slugs = normalizedItems.map((i) => i.slug);
  const products = await prisma.product.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true, price: true, salePrice: true },
  });
  const productBySlug = new Map(products.map((p) => [p.slug, p]));

  const missing = normalizedItems.filter((i) => !productBySlug.has(i.slug));
  if (missing.length > 0) {
    return NextResponse.json({ ok: false, error: 'Sản phẩm không tồn tại' }, { status: 400 });
  }

  const expiresAt = toExpiresAt();
  await prisma.$transaction(async (tx) => {
    const savedCart = await tx.savedCart.upsert({
      where: { userId: user.id },
      update: { expiresAt },
      create: { userId: user.id, expiresAt },
    });

    await tx.savedCartItem.deleteMany({ where: { cartId: savedCart.id } });

    const itemsData = normalizedItems.map((item) => {
      const product = productBySlug.get(item.slug);
      return {
        cartId: savedCart.id,
        productId: product.id,
        quantity: item.quantity,
        priceAtSave: product.salePrice ?? product.price,
      };
    });

    if (itemsData.length > 0) {
      await tx.savedCartItem.createMany({ data: itemsData });
    }
  });

  const cart = await prisma.savedCart.findUnique({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              slug: true,
              name: true,
              price: true,
              salePrice: true,
              images: { take: 1, select: { url: true } },
            },
          },
        },
      },
    },
  });

  return NextResponse.json({ ok: true, cart: cart ? serializeCart(cart) : null });
}

export async function DELETE(request) {
  const user = await getUserFromSession(request.cookies);
  if (!user) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

  await prisma.savedCart.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
}
