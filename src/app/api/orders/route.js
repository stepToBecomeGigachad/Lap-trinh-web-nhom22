import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { parseSession, sessionCookieName } from '../../../lib/auth';
import { logger, logSecurityEvent } from '../../../lib/logger';
import {
  validateOrderItems,
  validateQuantity,
  checkStockAvailability,
  sanitizeShippingInfo,
  sanitizeNote,
  calculateServerTotal,
  validateCoupon,
} from '../../../middleware/orderValidation';

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
  return NextResponse.json({ ok: true, items: orders, orders });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, shipping, note, couponCode, paymentMethod } = body || {};
    const normalizedPaymentMethod = paymentMethod === 'momo' ? 'momo' : 'cod';
    const paymentExpiresAt =
      normalizedPaymentMethod === 'momo'
        ? new Date(Date.now() + 30 * 60 * 1000)
        : null;

    // === 1. VALIDATE ORDER ITEMS ===
    const itemsValidation = validateOrderItems(items);
    if (!itemsValidation.valid) {
      logSecurityEvent(request, 'ORDER_INVALID_ITEMS', { error: itemsValidation.error });
      return NextResponse.json({ ok: false, error: itemsValidation.error }, { status: 400 });
    }

    // Validate each item quantity (防止负数攻击)
    for (const item of items) {
      const qtyValidation = validateQuantity(item.quantity);
      if (!qtyValidation.valid) {
        logSecurityEvent(request, 'ORDER_INVALID_QUANTITY', { slug: item.slug, quantity: item.quantity });
        return NextResponse.json({ ok: false, error: qtyValidation.error }, { status: 400 });
      }
      item.quantity = qtyValidation.value; // Use validated integer
    }

    // === 2. VALIDATE SHIPPING INFO ===
    const shippingValidation = sanitizeShippingInfo(shipping);
    if (!shippingValidation.valid) {
      return NextResponse.json({ ok: false, error: shippingValidation.error }, { status: 400 });
    }
    const safeShipping = shippingValidation.data;

    // === 3. SANITIZE NOTE ===
    const safeNote = sanitizeNote(note);

    // === 4. CHECK STOCK AVAILABILITY (Server-side verification) ===
    const stockCheck = await checkStockAvailability(items, prisma);
    if (!stockCheck.available) {
      logSecurityEvent(request, 'ORDER_INSUFFICIENT_STOCK', { items: stockCheck.insufficientItems });
      return NextResponse.json({
        ok: false,
        error: stockCheck.error,
        insufficientItems: stockCheck.insufficientItems,
      }, { status: 400 });
    }

    // === 5. CALCULATE TOTAL SERVER-SIDE (Never trust client prices) ===
    const dbProducts = await prisma.product.findMany({
      where: { slug: { in: items.map(i => i.slug) } },
      select: { id: true, slug: true, price: true, salePrice: true, stock: true, name: true }
    });

    const subtotal = calculateServerTotal(items, dbProducts);

    // === 6. VALIDATE COUPON SERVER-SIDE ===
    const couponValidation = await validateCoupon(couponCode, subtotal, prisma);
    let couponId = null;
    let discountAmount = 0;

    if (couponCode && couponValidation.valid) {
      discountAmount = couponValidation.discount;
      couponId = couponValidation.couponId;
    } else if (couponCode && !couponValidation.valid) {
      // Invalid coupon - continue without discount, log security event
      logSecurityEvent(request, 'ORDER_INVALID_COUPON', { code: couponCode, error: couponValidation.error });
    }

    // === 7. CALCULATE SHIPPING FEE ===
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const shippingFee = totalQuantity < 10 ? 10000 : 50000;

    // === 8. CALCULATE FINAL TOTAL ===
    const total = subtotal - discountAmount + shippingFee;

    // Verify total is positive
    if (total <= 0) {
      logSecurityEvent(request, 'ORDER_NEGATIVE_TOTAL', { subtotal, discountAmount, shippingFee, total });
      return NextResponse.json({ ok: false, error: 'Tổng đơn hàng không hợp lệ' }, { status: 400 });
    }

    // === 9. GET USER FROM SESSION ===
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

    // === 10. CREATE ORDER IN TRANSACTION (Atomic operation) ===
    const priceBySlug = Object.fromEntries(dbProducts.map(p => [p.slug, p.salePrice ?? p.price]));
    const idBySlug = Object.fromEntries(dbProducts.map(p => [p.slug, p.id]));

    // Determine if we should decrease stock now or after payment
    // COD: decrease stock immediately (order confirmed)
    // MoMo/Bank: decrease stock only after payment success
    const shouldDecreaseStockNow = normalizedPaymentMethod === 'cod';
    const initialStatus = normalizedPaymentMethod === 'cod' ? 'PENDING' : 'AWAITING_PAYMENT';

    const created = await prisma.$transaction(async (tx) => {
      // Double-check stock in transaction
      for (const it of items) {
        const product = await tx.product.findUnique({
          where: { id: idBySlug[it.slug] },
          select: { stock: true, name: true },
        });
        if (!product || product.stock < it.quantity) {
          throw new Error(`Sản phẩm "${product?.name || it.slug}" không đủ hàng`);
        }
      }

      // Create order
      const order = await tx.order.create({
        data: {
          userId,
          status: initialStatus,
          paymentMethod: normalizedPaymentMethod,
          paymentExpiresAt,
          total,
          discount: discountAmount,
          couponId,
          shippingName: safeShipping.name,
          phone: safeShipping.phone,
          address: safeShipping.address,
          city: safeShipping.city,
          district: safeShipping.district,
          note: safeNote,
          items: {
            create: items.map(it => ({
              productId: idBySlug[it.slug],
              quantity: it.quantity,
              priceAtOrder: priceBySlug[it.slug] || 0,
            })),
          },
        },
        select: { id: true },
      });

      // Only decrease stock for COD orders
      // For MoMo/Bank, stock will be decreased when payment is confirmed
      if (shouldDecreaseStockNow) {
        for (const it of items) {
          await tx.product.update({
            where: { id: idBySlug[it.slug] },
            data: { stock: { decrement: it.quantity } },
          });
        }

        // Increment coupon usage only for COD
        if (couponId) {
          await tx.coupon.update({
            where: { id: couponId },
            data: { usedCount: { increment: 1 } },
          });
        }
      }

      return order;
    });

    logger.info('Order created', { orderId: created.id, userId, total });

    if (userId && normalizedPaymentMethod === 'cod') {
      await prisma.savedCart.deleteMany({ where: { userId } });
    }

    return NextResponse.json({ ok: true, id: created.id, total });
  } catch (error) {
    logger.error('Order creation failed', { error: error.message });
    return NextResponse.json({ ok: false, error: error.message || 'Server error' }, { status: 500 });
  }
}
