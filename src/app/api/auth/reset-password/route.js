import { NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { hashPassword } from '../../../../lib/password';
import { validatePassword } from '../../../../middleware/passwordPolicy';

export async function POST(request) {
    try {
        const { token, password, confirmPassword } = await request.json();

        // Validate input
        if (!token || !password) {
            return NextResponse.json({ ok: false, error: 'Token và mật khẩu là bắt buộc' }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ ok: false, error: 'Mật khẩu xác nhận không khớp' }, { status: 400 });
        }

        // Validate password policy
        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return NextResponse.json({ ok: false, error: passwordValidation.errors.join(', ') }, { status: 400 });
        }

        // Find and validate token
        const resetToken = await prisma.passwordResetToken.findUnique({
            where: { token },
            include: { user: true },
        });

        if (!resetToken) {
            return NextResponse.json({ ok: false, error: 'Link đặt lại mật khẩu không hợp lệ' }, { status: 400 });
        }

        if (resetToken.used) {
            return NextResponse.json({ ok: false, error: 'Link đặt lại mật khẩu đã được sử dụng' }, { status: 400 });
        }

        if (new Date() > resetToken.expiresAt) {
            return NextResponse.json({ ok: false, error: 'Link đặt lại mật khẩu đã hết hạn' }, { status: 400 });
        }

        // Hash new password
        const passwordHash = hashPassword(password);

        // Update user password and mark token as used
        await prisma.$transaction([
            prisma.user.update({
                where: { id: resetToken.userId },
                data: { passwordHash },
            }),
            prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { used: true },
            }),
        ]);

        return NextResponse.json({
            ok: true,
            message: 'Mật khẩu đã được đặt lại thành công'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        return NextResponse.json({ ok: false, error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}

// Verify token (GET)
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
        return NextResponse.json({ ok: false, error: 'Token không hợp lệ' }, { status: 400 });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
        where: { token },
    });

    if (!resetToken) {
        return NextResponse.json({ ok: false, valid: false, error: 'Token không tồn tại' });
    }

    if (resetToken.used) {
        return NextResponse.json({ ok: false, valid: false, error: 'Token đã được sử dụng' });
    }

    if (new Date() > resetToken.expiresAt) {
        return NextResponse.json({ ok: false, valid: false, error: 'Token đã hết hạn' });
    }

    return NextResponse.json({ ok: true, valid: true });
}
