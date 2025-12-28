import { NextResponse } from 'next/server';

/**
 * Order Validation Middleware
 * Prevents order manipulation attacks
 */

// Validation constants
const ORDER_LIMITS = {
    MIN_QUANTITY: 1,
    MAX_QUANTITY: 99,
    MAX_ITEMS: 50,
    MIN_PRICE: 1000,        // 1,000 VND minimum
    MAX_PRICE: 100000000,   // 100M VND maximum
    MAX_NOTE_LENGTH: 500,
};

/**
 * Validate order quantity
 */
export function validateQuantity(quantity) {
    const qty = parseInt(quantity, 10);

    if (isNaN(qty) || !Number.isInteger(qty)) {
        return { valid: false, error: 'Số lượng không hợp lệ' };
    }

    if (qty < ORDER_LIMITS.MIN_QUANTITY) {
        return { valid: false, error: 'Số lượng phải lớn hơn 0' };
    }

    if (qty > ORDER_LIMITS.MAX_QUANTITY) {
        return { valid: false, error: `Số lượng tối đa là ${ORDER_LIMITS.MAX_QUANTITY}` };
    }

    return { valid: true, value: qty };
}

/**
 * Validate price (server-side - never trust client price)
 */
export function validatePrice(price) {
    const p = parseFloat(price);

    if (isNaN(p) || p < ORDER_LIMITS.MIN_PRICE || p > ORDER_LIMITS.MAX_PRICE) {
        return { valid: false, error: 'Giá không hợp lệ' };
    }

    return { valid: true, value: p };
}

/**
 * Validate order items array
 */
export function validateOrderItems(items) {
    if (!Array.isArray(items)) {
        return { valid: false, error: 'Danh sách sản phẩm không hợp lệ' };
    }

    if (items.length === 0) {
        return { valid: false, error: 'Giỏ hàng trống' };
    }

    if (items.length > ORDER_LIMITS.MAX_ITEMS) {
        return { valid: false, error: `Tối đa ${ORDER_LIMITS.MAX_ITEMS} sản phẩm` };
    }

    // Validate each item
    for (const item of items) {
        if (!item.slug || typeof item.slug !== 'string') {
            return { valid: false, error: 'Sản phẩm không hợp lệ' };
        }

        const qtyValidation = validateQuantity(item.quantity);
        if (!qtyValidation.valid) {
            return qtyValidation;
        }
    }

    return { valid: true };
}

/**
 * Check stock availability
 * Returns { available: boolean, insufficientItems: [] }
 */
export async function checkStockAvailability(items, prisma) {
    const slugs = items.map(i => i.slug);

    const products = await prisma.product.findMany({
        where: { slug: { in: slugs } },
        select: { slug: true, name: true, stock: true, price: true, salePrice: true },
    });

    const productMap = new Map(products.map(p => [p.slug, p]));
    const insufficientItems = [];
    const validatedItems = [];

    for (const item of items) {
        const product = productMap.get(item.slug);

        if (!product) {
            return {
                available: false,
                error: `Sản phẩm "${item.slug}" không tồn tại`,
                insufficientItems: [item.slug],
            };
        }

        if (product.stock < item.quantity) {
            insufficientItems.push({
                slug: item.slug,
                name: product.name,
                requested: item.quantity,
                available: product.stock,
            });
        }

        // Add server-side price (never trust client)
        validatedItems.push({
            ...item,
            serverPrice: product.salePrice ?? product.price,
            productId: product.id,
        });
    }

    if (insufficientItems.length > 0) {
        return {
            available: false,
            error: 'Một số sản phẩm không đủ số lượng',
            insufficientItems,
        };
    }

    return { available: true, validatedItems, products };
}

/**
 * Sanitize shipping info
 */
export function sanitizeShippingInfo(shipping) {
    if (!shipping || typeof shipping !== 'object') {
        return { valid: false, error: 'Thông tin giao hàng không hợp lệ' };
    }

    const { name, phone, address, city, district } = shipping;

    // Required fields
    if (!name?.trim() || !phone?.trim() || !address?.trim()) {
        return { valid: false, error: 'Vui lòng điền đầy đủ thông tin giao hàng' };
    }

    // Validate phone
    const phoneClean = phone.replace(/[\s-]/g, '');
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    if (!phoneRegex.test(phoneClean)) {
        return { valid: false, error: 'Số điện thoại không hợp lệ' };
    }

    // Sanitize - remove potential XSS
    const sanitize = (str) => {
        if (!str) return '';
        return String(str)
            .trim()
            .substring(0, 200)
            .replace(/[<>]/g, '');
    };

    return {
        valid: true,
        data: {
            name: sanitize(name),
            phone: phoneClean,
            address: sanitize(address),
            city: sanitize(city || ''),
            district: sanitize(district || ''),
        },
    };
}

/**
 * Validate note field
 */
export function sanitizeNote(note) {
    if (!note) return '';
    return String(note)
        .trim()
        .substring(0, ORDER_LIMITS.MAX_NOTE_LENGTH)
        .replace(/[<>]/g, '');
}

/**
 * Calculate order total server-side
 * NEVER trust client-side calculations
 */
export function calculateServerTotal(items, products) {
    const productMap = new Map(products.map(p => [p.slug, p]));
    let subtotal = 0;

    for (const item of items) {
        const product = productMap.get(item.slug);
        if (product) {
            const price = product.salePrice ?? product.price;
            subtotal += price * item.quantity;
        }
    }

    return subtotal;
}

/**
 * Validate coupon (server-side)
 */
export async function validateCoupon(code, subtotal, prisma) {
    if (!code) return { valid: true, discount: 0 };

    const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive) {
        return { valid: false, error: 'Mã giảm giá không tồn tại hoặc đã hết hạn' };
    }

    // Check expiry
    if (coupon.endDate && new Date(coupon.endDate) < new Date()) {
        return { valid: false, error: 'Mã giảm giá đã hết hạn' };
    }

    // Check start date
    if (coupon.startDate && new Date(coupon.startDate) > new Date()) {
        return { valid: false, error: 'Mã giảm giá chưa có hiệu lực' };
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return { valid: false, error: 'Mã giảm giá đã hết lượt sử dụng' };
    }

    // Check minimum order
    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
        return { valid: false, error: `Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString()}đ` };
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'percent') {
        discount = Math.round(subtotal * coupon.discountValue / 100);
        if (coupon.maxDiscount) {
            discount = Math.min(discount, coupon.maxDiscount);
        }
    } else {
        discount = coupon.discountValue;
    }

    return { valid: true, discount, couponId: coupon.id };
}
