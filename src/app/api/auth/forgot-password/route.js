import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '../../../../lib/prisma';
import { sendPasswordResetEmail } from '../../../../lib/email';

export async function POST(request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ ok: false, error: 'Email là bắt buộc' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Find user
        const user = await prisma.user.findUnique({
            where: { email: normalizedEmail },
        });

        // Always return success to prevent email enumeration
        if (!user) {
            console.log('Password reset requested for non-existent email:', normalizedEmail);
            return NextResponse.json({
                ok: true,
                message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu'
            });
        }

        // Check if user signed up with Google (no password)
        if (user.provider === 'google' && !user.passwordHash) {
            return NextResponse.json({
                ok: true,
                message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu'
            });
        }

        // Invalidate any existing tokens
        await prisma.passwordResetToken.updateMany({
            where: { userId: user.id, used: false },
            data: { used: true },
        });

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Save token to database
        await prisma.passwordResetToken.create({
            data: {
                token,
                userId: user.id,
                expiresAt,
            },
        });

        // Send email
        const emailResult = await sendPasswordResetEmail(normalizedEmail, token, user.name);

        if (!emailResult.success) {
            console.error('Failed to send password reset email:', emailResult.error);
            // Don't expose email sending failure to user
        }

        return NextResponse.json({
            ok: true,
            message: 'Nếu email tồn tại, bạn sẽ nhận được link đặt lại mật khẩu'
        });

    } catch (error) {
        console.error('Forgot password error:', error);
        return NextResponse.json({ ok: false, error: 'Có lỗi xảy ra' }, { status: 500 });
    }
}
