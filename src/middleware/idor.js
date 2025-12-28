import { NextResponse } from 'next/server';

/**
 * IDOR (Insecure Direct Object Reference) Prevention
 * Ensures users can only access their own resources
 */

/**
 * Check if user can access order
 */
export function canAccessOrder(order, session) {
    if (!order || !session) return false;

    // Admin can access all orders
    if (session.role === 'admin') return true;

    // User can only access their own orders
    if (order.userId && session.id) {
        return order.userId === session.id;
    }

    // Guest orders - check by email
    if (order.guestEmail && session.email) {
        return order.guestEmail.toLowerCase() === session.email.toLowerCase();
    }

    return false;
}

/**
 * Check if user can modify order
 */
export function canModifyOrder(order, session) {
    if (!canAccessOrder(order, session)) return false;

    // Only pending orders can be modified by users
    if (session.role !== 'admin' && order.status !== 'PENDING') {
        return false;
    }

    return true;
}

/**
 * Check if user can access user profile
 */
export function canAccessUser(userId, session) {
    if (!session) return false;

    // Admin can access all users
    if (session.role === 'admin') return true;

    // User can only access their own profile
    return session.id === userId;
}

/**
 * Check if user can access review
 */
export function canAccessReview(review, session) {
    if (!review || !session) return false;

    // Admin can access all reviews
    if (session.role === 'admin') return true;

    // User can only access their own reviews
    return review.userId === session.id;
}

/**
 * Middleware to verify resource ownership
 */
export function verifyOwnership(resourceType) {
    return async (request, session, resourceId, prisma) => {
        switch (resourceType) {
            case 'order': {
                const order = await prisma.order.findUnique({
                    where: { id: resourceId },
                    select: { id: true, userId: true, guestEmail: true, status: true },
                });
                if (!order) {
                    return { allowed: false, status: 404, error: 'Đơn hàng không tồn tại' };
                }
                if (!canAccessOrder(order, session)) {
                    return { allowed: false, status: 403, error: 'Không có quyền truy cập' };
                }
                return { allowed: true, resource: order };
            }

            case 'user': {
                if (!canAccessUser(resourceId, session)) {
                    return { allowed: false, status: 403, error: 'Không có quyền truy cập' };
                }
                return { allowed: true };
            }

            case 'review': {
                const review = await prisma.review.findUnique({
                    where: { id: resourceId },
                    select: { id: true, userId: true },
                });
                if (!review) {
                    return { allowed: false, status: 404, error: 'Đánh giá không tồn tại' };
                }
                if (!canAccessReview(review, session)) {
                    return { allowed: false, status: 403, error: 'Không có quyền truy cập' };
                }
                return { allowed: true, resource: review };
            }

            default:
                return { allowed: false, status: 400, error: 'Invalid resource type' };
        }
    };
}

/**
 * Create IDOR-safe response for order
 */
export function sanitizeOrderResponse(order, session) {
    // Admin sees everything
    if (session?.role === 'admin') return order;

    // Remove sensitive internal fields for regular users
    const { internalNotes, ...safeOrder } = order;
    return safeOrder;
}

/**
 * Create IDOR-safe response for user
 */
export function sanitizeUserResponse(user, session) {
    // Admin sees everything
    if (session?.role === 'admin') return user;

    // Remove sensitive fields
    const { passwordHash, ...safeUser } = user;
    return safeUser;
}
