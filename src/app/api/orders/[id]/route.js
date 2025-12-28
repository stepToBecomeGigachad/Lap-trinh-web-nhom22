import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { parseSession, sessionCookieName } from '../../../../lib/auth';
import { logger, logSecurityEvent } from '../../../../lib/logger';
import { canAccessOrder, canModifyOrder, sanitizeOrderResponse } from '../../../../middleware/idor';

async function getUserIdFromSession(cookies) {
  const token = cookies.get(sessionCookieName())?.value;
  const sess = await parseSession(token);
  if (!sess?.email) return { userId: null, role: 'guest' };
  const user = await prisma.user.upsert({
    where: { email: sess.email },
    update: { name: sess.name ?? '' },
    create: { email: sess.email, name: sess.name ?? '', passwordHash: '', role: sess.role === 'admin' ? 'ADMIN' : 'USER' },
  });
  return { userId: user.id, role: sess.role || 'user' };
}

export async function GET(request, { params }) {
  const { id } = params;
  const { userId, role } = await getUserIdFromSession(request.cookies);

  // IDOR Protection: Check access rights
  const accessCheck = await canAccessOrder(id, userId, role, prisma);
  if (!accessCheck.allowed) {
    logSecurityEvent(request, 'IDOR_ORDER_ACCESS_DENIED', { orderId: id, userId, attemptedRole: role });
    return NextResponse.json({ ok: false, error: accessCheck.reason || 'Không có quyền truy cập' }, { status: 403 });
  }

  const order = await prisma.order.findFirst({
    where: { id },
    include: {
      items: {
        include: {
          product: { select: { slug: true, name: true, images: { take: 1, select: { url: true } } } },
        },
      },
    },
  });

  if (!order) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  // Format and sanitize order response (remove sensitive data for non-admin)
  const formattedOrder = {
    id: order.id,
    status: order.status?.toLowerCase() || 'pending',
    total: order.total,
    createdAt: order.createdAt,
    paymentMethod: order.paymentMethod || 'cod',
    shipping: order.shippingName ? {
      name: order.shippingName,
      phone: order.phone,
      address: order.address,
      city: order.city,
      district: order.district
    } : null,
    items: order.items.map(item => ({
      id: item.id,
      quantity: item.quantity,
      price: item.priceAtOrder,
      product: item.product ? {
        slug: item.product.slug,
        name: item.product.name,
        image: item.product.images?.[0]?.url || '/images/placeholder.jpg'
      } : null
    }))
  };

  logger.info('Order accessed', { orderId: id, userId, role });
  return NextResponse.json(formattedOrder);
}

export async function POST(request, { params }) {
  const { id } = params;
  const body = await request.json().catch(() => ({}));
  const action = body?.action;
  const { userId, role } = await getUserIdFromSession(request.cookies);

  // IDOR Protection: Check modify rights
  const modifyCheck = await canModifyOrder(id, userId, role, action, prisma);
  if (!modifyCheck.allowed) {
    logSecurityEvent(request, 'IDOR_ORDER_MODIFY_DENIED', { orderId: id, userId, action, reason: modifyCheck.reason });
    return NextResponse.json({ ok: false, error: modifyCheck.reason || 'Không có quyền thực hiện hành động này' }, { status: 403 });
  }

  if (action === 'cancel') {
    const order = await prisma.order.findFirst({
      where: { id },
      include: { items: { select: { productId: true, quantity: true } } }
    });

    if (!order) return NextResponse.json({ ok: false, error: 'Đơn hàng không tồn tại' }, { status: 404 });

    if (order.status !== 'PENDING') {
      return NextResponse.json({ ok: false, error: 'Chỉ có thể hủy đơn hàng đang chờ xử lý' }, { status: 400 });
    }

    // Use transaction to ensure data consistency
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({ where: { id }, data: { status: 'CANCELLED' } });

      // Restore stock for each product
      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }
    });

    logger.info('Order cancelled', { orderId: id, userId, role });
    return NextResponse.json({ ok: true, message: 'Đơn hàng đã hủy và khôi phục số lượng tồn kho' });
  }

  return NextResponse.json({ ok: false, error: 'Hành động không được hỗ trợ' }, { status: 400 });
}
