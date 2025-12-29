import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { parseSession, sessionCookieName } from '../../../../../lib/auth';
import { createMoMoPayment } from '../../../../../lib/momo';

/**
 * Create MoMo payment for an order
 * POST /api/payment/momo/create
 */
export async function POST(request) {
    try {
        const token = request.cookies.get(sessionCookieName())?.value;
        const sess = await parseSession(token);

        if (!sess?.email) {
            return NextResponse.json({ ok: false, error: 'Vui lòng đăng nhập' }, { status: 401 });
        }

        const body = await request.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json({ ok: false, error: 'Thiếu mã đơn hàng' }, { status: 400 });
        }

        // Get order from database
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                user: { select: { email: true } },
                items: {
                    include: {
                        product: { select: { name: true } }
                    }
                }
            }
        });

        if (!order) {
            return NextResponse.json({ ok: false, error: 'Không tìm thấy đơn hàng' }, { status: 404 });
        }

        // Verify order belongs to user
        if (order.user?.email !== sess.email) {
            return NextResponse.json({ ok: false, error: 'Không có quyền truy cập đơn hàng này' }, { status: 403 });
        }

        // Check if order is already paid
        if (order.status === 'PAID' || order.status === 'COMPLETED') {
            return NextResponse.json({ ok: false, error: 'Đơn hàng đã được thanh toán' }, { status: 400 });
        }

        // Create order info string
        const itemNames = order.items.map(i => i.product.name).slice(0, 3).join(', ');
        const orderInfo = `Thanh toán đơn hàng #${orderId.slice(-8).toUpperCase()} - ${itemNames}${order.items.length > 3 ? '...' : ''}`;

        // Create MoMo payment
        const result = await createMoMoPayment({
            orderId,
            amount: Math.round(order.total), // MoMo requires integer
            orderInfo: orderInfo.substring(0, 256), // Max 256 chars
        });

        if (result.success) {
            const paymentExpiresAt = order.paymentExpiresAt
                ? order.paymentExpiresAt
                : new Date(Date.now() + 30 * 60 * 1000);
            // Update order with payment info
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: 'AWAITING_PAYMENT',
                    paymentMethod: 'momo',
                    paymentExpiresAt,
                }
            });

            return NextResponse.json({
                ok: true,
                payUrl: result.payUrl,
                qrCodeUrl: result.qrCodeUrl,
                deeplink: result.deeplink,
            });
        } else {
            return NextResponse.json({
                ok: false,
                error: result.error,
            }, { status: 400 });
        }
    } catch (error) {
        console.error('[MoMo Create] Error:', error);
        return NextResponse.json({ ok: false, error: 'Lỗi hệ thống' }, { status: 500 });
    }
}
