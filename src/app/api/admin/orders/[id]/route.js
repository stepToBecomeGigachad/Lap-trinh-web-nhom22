import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { logger, logSecurityEvent } from '../../../../../lib/logger';

const VALID_STATUSES = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export async function GET(_req, { params }) {
  const { id } = params;

  // Validate ID format (UUID)
  if (!id || !/^[a-f0-9-]{36}$/i.test(id)) {
    return NextResponse.json({ ok: false, error: 'Invalid order ID' }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, name: true } },
      items: { include: { product: { select: { slug: true, name: true, stock: true } } } },
    },
  });

  if (!order) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

  logger.info('Admin order detail fetched', { orderId: id });
  return NextResponse.json({ ok: true, order });
}

export async function PUT(request, { params }) {
  const { id } = params;

  // Validate ID format
  if (!id || !/^[a-f0-9-]{36}$/i.test(id)) {
    return NextResponse.json({ ok: false, error: 'Invalid order ID' }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const newStatus = body?.status?.toUpperCase();

  if (!newStatus) {
    return NextResponse.json({ ok: false, error: 'Missing status' }, { status: 400 });
  }

  // Validate status value
  if (!VALID_STATUSES.includes(newStatus)) {
    logSecurityEvent(request, 'ADMIN_INVALID_STATUS', { orderId: id, status: newStatus });
    return NextResponse.json({ ok: false, error: 'Invalid status value' }, { status: 400 });
  }

  // Get current order with items to handle stock changes
  const currentOrder = await prisma.order.findUnique({
    where: { id },
    include: { items: { select: { productId: true, quantity: true } } }
  });

  if (!currentOrder) {
    return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 });
  }

  const oldStatus = currentOrder.status;

  // No change needed
  if (oldStatus === newStatus) {
    return NextResponse.json({ ok: true, message: 'Trạng thái không thay đổi' });
  }

  // Handle stock restoration when order is cancelled
  if (newStatus === 'CANCELLED' && oldStatus !== 'CANCELLED') {
    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({ where: { id }, data: { status: newStatus } });

      // Restore stock for each product
      for (const item of currentOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        });
      }
    });

    logger.info('Order cancelled by admin', { orderId: id, oldStatus, newStatus });
    return NextResponse.json({ ok: true, message: 'Đơn hàng đã hủy và khôi phục tồn kho' });
  }

  // Handle stock decrement when order is restored from cancelled (edge case)
  if (oldStatus === 'CANCELLED' && newStatus !== 'CANCELLED') {
    // Check if stock is available
    for (const item of currentOrder.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product || product.stock < item.quantity) {
        return NextResponse.json({
          ok: false,
          error: `Không đủ tồn kho cho sản phẩm ${product?.name || 'không xác định'}`
        }, { status: 400 });
      }
    }

    await prisma.$transaction(async (tx) => {
      // Update order status
      await tx.order.update({ where: { id }, data: { status: newStatus } });

      // Decrement stock for each product
      for (const item of currentOrder.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }
    });

    logger.info('Order restored by admin', { orderId: id, oldStatus, newStatus });
    return NextResponse.json({ ok: true, message: 'Đơn hàng đã được khôi phục và trừ tồn kho' });
  }

  // Normal status update without stock changes
  await prisma.order.update({ where: { id }, data: { status: newStatus } });

  logger.info('Order status updated by admin', { orderId: id, oldStatus, newStatus });
  return NextResponse.json({ ok: true });
}
