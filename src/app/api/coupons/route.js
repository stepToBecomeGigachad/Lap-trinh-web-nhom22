import { NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// GET - Validate coupon code (public endpoint)
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const orderTotal = parseFloat(searchParams.get('total') || '0');

    if (!code) {
        return NextResponse.json({ ok: false, error: 'Vui lòng nhập mã giảm giá' }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() }
    });

    if (!coupon) {
        return NextResponse.json({ ok: false, error: 'Mã giảm giá không tồn tại' }, { status: 404 });
    }

    // Check if active
    if (!coupon.isActive) {
        return NextResponse.json({ ok: false, error: 'Mã giảm giá đã hết hiệu lực' }, { status: 400 });
    }

    // Check date validity
    const now = new Date();
    if (coupon.startDate && now < new Date(coupon.startDate)) {
        return NextResponse.json({ ok: false, error: 'Mã giảm giá chưa có hiệu lực' }, { status: 400 });
    }
    if (coupon.endDate && now > new Date(coupon.endDate)) {
        return NextResponse.json({ ok: false, error: 'Mã giảm giá đã hết hạn' }, { status: 400 });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json({ ok: false, error: 'Mã giảm giá đã hết lượt sử dụng' }, { status: 400 });
    }

    // Check minimum order value
    if (coupon.minOrderValue && orderTotal < coupon.minOrderValue) {
        return NextResponse.json({
            ok: false,
            error: `Đơn hàng tối thiểu ${coupon.minOrderValue.toLocaleString('vi-VN')} đ để áp dụng mã này`
        }, { status: 400 });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percent') {
        discountAmount = orderTotal * (coupon.discountValue / 100);
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
            discountAmount = coupon.maxDiscount;
        }
    } else {
        discountAmount = coupon.discountValue;
    }

    // Discount cannot exceed order total
    if (discountAmount > orderTotal) {
        discountAmount = orderTotal;
    }

    return NextResponse.json({
        ok: true,
        coupon: {
            id: coupon.id,
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            discountAmount: Math.round(discountAmount),
        }
    });
}
