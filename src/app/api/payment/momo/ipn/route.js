import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { verifyMoMoSignature, isMoMoPaymentSuccess, getMoMoResultMessage } from '../../../../../lib/momo';

/**
 * MoMo IPN (Instant Payment Notification) Webhook
 * POST /api/payment/momo/ipn
 * 
 * MoMo will call this endpoint to notify payment result
 */
export async function POST(request) {
    try {
        const data = await request.json();
        console.log('[MoMo IPN] Received:', data);

        const { orderId, resultCode, transId, amount, message } = data;

        // Verify signature
        const isValidSignature = verifyMoMoSignature(data);
        if (!isValidSignature) {
            console.error('[MoMo IPN] Invalid signature');
            return NextResponse.json({
                resultCode: 1,
                message: 'Invalid signature'
            });
        }

        // Get order with items
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: {
                    select: { productId: true, quantity: true }
                }
            }
        });

        if (!order) {
            console.error('[MoMo IPN] Order not found:', orderId);
            return NextResponse.json({
                resultCode: 1,
                message: 'Order not found'
            });
        }

        // Check if payment is successful
        if (isMoMoPaymentSuccess(resultCode)) {
            // Use transaction to update order and decrease stock atomically
            await prisma.$transaction(async (tx) => {
                // Update order status to PAID
                await tx.order.update({
                    where: { id: orderId },
                    data: {
                        status: 'PAID',
                        note: order.note
                            ? `${order.note}\n[MoMo] Thanh toán thành công - TransId: ${transId}`
                            : `[MoMo] Thanh toán thành công - TransId: ${transId}`,
                    }
                });

                // Decrease stock for each item (only on successful payment)
                for (const item of order.items) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: { stock: { decrement: item.quantity } },
                    });
                }

                // Increment coupon usage if applicable
                if (order.couponId) {
                    await tx.coupon.update({
                        where: { id: order.couponId },
                        data: { usedCount: { increment: 1 } },
                    });
                }

                if (order.userId) {
                    await tx.savedCart.deleteMany({ where: { userId: order.userId } });
                }
            });

            console.log('[MoMo IPN] Payment success, stock decreased:', { orderId, transId, amount });
        } else {
            // Payment failed - update order status
            await prisma.order.update({
                where: { id: orderId },
                data: {
                    status: 'PAYMENT_FAILED',
                    note: order.note
                        ? `${order.note}\n[MoMo] Thanh toán thất bại: ${getMoMoResultMessage(resultCode)}`
                        : `[MoMo] Thanh toán thất bại: ${getMoMoResultMessage(resultCode)}`,
                }
            });

            console.log('[MoMo IPN] Payment failed:', { orderId, resultCode, message });
        }

        // Return success to MoMo
        return NextResponse.json({
            resultCode: 0,
            message: 'Success'
        });
    } catch (error) {
        console.error('[MoMo IPN] Error:', error);
        return NextResponse.json({
            resultCode: 1,
            message: 'Internal error'
        });
    }
}
