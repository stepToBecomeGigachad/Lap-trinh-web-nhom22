import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';
import { parseSession, sessionCookieName } from '../../../../../lib/auth';

async function checkAdmin(request) {
    const token = request.cookies.get(sessionCookieName())?.value;
    const sess = await parseSession(token);
    return sess?.role === 'admin';
}

// GET - Get single coupon
export async function GET(request, { params }) {
    if (!(await checkAdmin(request))) {
        return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;
    const coupon = await prisma.coupon.findUnique({ where: { id } });

    if (!coupon) {
        return NextResponse.json({ ok: false, error: 'Không tìm thấy' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, coupon });
}

// PUT - Update coupon
export async function PUT(request, { params }) {
    if (!(await checkAdmin(request))) {
        return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { id } = await params;
        const body = await request.json();
        const { code, description, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, isActive, startDate, endDate } = body;

        // Check if new code already exists (excluding current coupon)
        if (code) {
            const existing = await prisma.coupon.findFirst({
                where: { code: code.toUpperCase(), id: { not: id } }
            });
            if (existing) {
                return NextResponse.json({ ok: false, error: 'Mã giảm giá đã tồn tại' }, { status: 400 });
            }
        }

        const coupon = await prisma.coupon.update({
            where: { id },
            data: {
                ...(code && { code: code.toUpperCase() }),
                ...(description !== undefined && { description }),
                ...(discountType && { discountType }),
                ...(discountValue !== undefined && { discountValue: parseFloat(discountValue) }),
                ...(minOrderValue !== undefined && { minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null }),
                ...(maxDiscount !== undefined && { maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null }),
                ...(usageLimit !== undefined && { usageLimit: usageLimit ? parseInt(usageLimit) : null }),
                ...(isActive !== undefined && { isActive }),
                ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : new Date() }),
                ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
            }
        });

        return NextResponse.json({ ok: true, coupon });
    } catch (err) {
        console.error('Update coupon error:', err);
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
}

// DELETE - Delete coupon
export async function DELETE(request, { params }) {
    if (!(await checkAdmin(request))) {
        return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }

    try {
        const { id } = await params;
        await prisma.coupon.delete({ where: { id } });
        return NextResponse.json({ ok: true });
    } catch (err) {
        console.error('Delete coupon error:', err);
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
}
