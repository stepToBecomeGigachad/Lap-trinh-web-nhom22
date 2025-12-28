import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email, resetToken, userName) {
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`;

    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'BookStore <onboarding@resend.dev>',
            to: email,
            subject: 'Đặt lại mật khẩu - BookStore',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6b4bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #6b4bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { margin-top: 20px; font-size: 12px; color: #666; }
            .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 5px; margin-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📚 BookStore</h1>
            </div>
            <div class="content">
              <h2>Xin chào ${userName || 'bạn'},</h2>
              <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
              <p>Click vào nút bên dưới để đặt lại mật khẩu:</p>
              
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
              </p>
              
              <p>Hoặc copy link này vào trình duyệt:</p>
              <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 5px;">
                ${resetUrl}
              </p>
              
              <div class="warning">
                <strong>⚠️ Lưu ý:</strong>
                <ul>
                  <li>Link này sẽ hết hạn sau <strong>1 giờ</strong></li>
                  <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                </ul>
              </div>
              
              <div class="footer">
                <p>Trân trọng,<br>Đội ngũ BookStore</p>
                <p>Email này được gửi tự động, vui lòng không trả lời.</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
        });

        if (error) {
            console.error('Email send error:', error);
            return { success: false, error: error.message };
        }

        console.log('Password reset email sent:', data);
        return { success: true, id: data.id };
    } catch (error) {
        console.error('Email service error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Send welcome email after registration
 */
export async function sendWelcomeEmail(email, userName) {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'BookStore <onboarding@resend.dev>',
            to: email,
            subject: 'Chào mừng đến với BookStore! 📚',
            html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6b4bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #6b4bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📚 Chào mừng đến BookStore!</h1>
            </div>
            <div class="content">
              <h2>Xin chào ${userName},</h2>
              <p>Cảm ơn bạn đã đăng ký tài khoản tại BookStore!</p>
              <p>Bây giờ bạn có thể:</p>
              <ul>
                <li>🛒 Mua sắm hàng ngàn đầu sách</li>
                <li>💰 Nhận ưu đãi độc quyền</li>
                <li>📦 Theo dõi đơn hàng dễ dàng</li>
              </ul>
              <p style="text-align: center; margin-top: 20px;">
                <a href="${process.env.NEXTAUTH_URL}" class="button">Bắt đầu mua sắm</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
        });

        if (error) {
            console.error('Welcome email error:', error);
            return { success: false, error: error.message };
        }

        return { success: true, id: data.id };
    } catch (error) {
        console.error('Email service error:', error);
        return { success: false, error: error.message };
    }
}
