import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { parseSession, sessionCookieName } from '../../../../lib/auth';

async function checkAdmin(request) {
    const token = request.cookies.get(sessionCookieName())?.value;
    const sess = await parseSession(token);
    return sess?.role === 'admin';
}

// GET - List all coupons (admin only)
export async function GET(request) {
    if (!(await checkAdmin(request))) {
        return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const q = searchParams.get('q') || '';

    const where = q ? {
        OR: [
            { code: { contains: q } },
            { description: { contains: q } }
        ]
    } : {};

    const [items, total] = await Promise.all([
        prisma.coupon.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.coupon.count({ where })
    ]);

    return NextResponse.json({ ok: true, items, total, page, limit });
}

// POST - Create new coupon
export async function POST(request) {
    if (!(await checkAdmin(request))) {
        return NextResponse.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { code, description, discountType, discountValue, minOrderValue, maxDiscount, usageLimit, isActive, startDate, endDate } = body;

        if (!code || !discountValue) {
            return NextResponse.json({ ok: false, error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
        }

        // Check if code already exists
        const existing = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
        if (existing) {
            return NextResponse.json({ ok: false, error: 'Mã giảm giá đã tồn tại' }, { status: 400 });
        }

        const coupon = await prisma.coupon.create({
            data: {
                code: code.toUpperCase(),
                description: description || null,
                discountType: discountType || 'percent',
                discountValue: parseFloat(discountValue),
                minOrderValue: minOrderValue ? parseFloat(minOrderValue) : null,
                maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
                usageLimit: usageLimit ? parseInt(usageLimit) : null,
                isActive: isActive !== false,
                startDate: startDate ? new Date(startDate) : new Date(),
                endDate: endDate ? new Date(endDate) : null,
            }
        });

        return NextResponse.json({ ok: true, coupon });
    } catch (err) {
        console.error('Create coupon error:', err);
        return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
    }
}
