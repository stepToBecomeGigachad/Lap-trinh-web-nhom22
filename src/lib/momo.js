import crypto from 'crypto';

/**
 * MoMo Payment Integration
 * Documentation: https://developers.momo.vn/v3/docs/payment/api/payment-api/
 */

const MOMO_CONFIG = {
    partnerCode: process.env.MOMO_PARTNER_CODE || 'MOMO',
    accessKey: process.env.MOMO_ACCESS_KEY || 'F8BBA842ECF85',
    secretKey: process.env.MOMO_SECRET_KEY || 'K951B6PE1waDMi640xX08PD3vg6EkVlz',
    endpoint: process.env.MOMO_ENDPOINT || 'https://test-payment.momo.vn/v2/gateway/api/create',
    redirectUrl: process.env.MOMO_REDIRECT_URL || 'http://localhost:3000/payment/momo/callback',
    ipnUrl: process.env.MOMO_IPN_URL || 'http://localhost:3000/api/payment/momo/ipn',
};

/**
 * Create MoMo payment request
 * @param {Object} params - Payment parameters
 * @param {string} params.orderId - Order ID
 * @param {number} params.amount - Amount in VND
 * @param {string} params.orderInfo - Order description
 * @returns {Promise<Object>} MoMo response with payUrl
 */
export async function createMoMoPayment({ orderId, amount, orderInfo }) {
    const requestId = `${orderId}_${Date.now()}`;
    const requestType = 'captureWallet'; // QR code payment

    // Create raw signature string
    const rawSignature = [
        `accessKey=${MOMO_CONFIG.accessKey}`,
        `amount=${amount}`,
        `extraData=`,
        `ipnUrl=${MOMO_CONFIG.ipnUrl}`,
        `orderId=${orderId}`,
        `orderInfo=${orderInfo}`,
        `partnerCode=${MOMO_CONFIG.partnerCode}`,
        `redirectUrl=${MOMO_CONFIG.redirectUrl}`,
        `requestId=${requestId}`,
        `requestType=${requestType}`,
    ].join('&');

    // Create HMAC SHA256 signature
    const signature = crypto
        .createHmac('sha256', MOMO_CONFIG.secretKey)
        .update(rawSignature)
        .digest('hex');

    // Request body
    const requestBody = {
        partnerCode: MOMO_CONFIG.partnerCode,
        accessKey: MOMO_CONFIG.accessKey,
        requestId,
        amount,
        orderId,
        orderInfo,
        redirectUrl: MOMO_CONFIG.redirectUrl,
        ipnUrl: MOMO_CONFIG.ipnUrl,
        extraData: '',
        requestType,
        signature,
        lang: 'vi',
    };

    console.log('[MoMo] Creating payment:', { orderId, amount, orderInfo });

    try {
        const response = await fetch(MOMO_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();
        console.log('[MoMo] Response:', data);

        if (data.resultCode === 0) {
            return {
                success: true,
                payUrl: data.payUrl,
                qrCodeUrl: data.qrCodeUrl,
                deeplink: data.deeplink,
                requestId,
            };
        } else {
            return {
                success: false,
                error: data.message || 'Không thể tạo thanh toán MoMo',
                resultCode: data.resultCode,
            };
        }
    } catch (error) {
        console.error('[MoMo] Error:', error);
        return {
            success: false,
            error: 'Lỗi kết nối đến MoMo',
        };
    }
}

/**
 * Verify MoMo callback/IPN signature
 * @param {Object} data - Callback data from MoMo
 * @returns {boolean} True if signature is valid
 */
export function verifyMoMoSignature(data) {
    const {
        accessKey,
        amount,
        extraData,
        message,
        orderId,
        orderInfo,
        orderType,
        partnerCode,
        payType,
        requestId,
        responseTime,
        resultCode,
        transId,
        signature,
    } = data;

    const rawSignature = [
        `accessKey=${accessKey}`,
        `amount=${amount}`,
        `extraData=${extraData}`,
        `message=${message}`,
        `orderId=${orderId}`,
        `orderInfo=${orderInfo}`,
        `orderType=${orderType}`,
        `partnerCode=${partnerCode}`,
        `payType=${payType}`,
        `requestId=${requestId}`,
        `responseTime=${responseTime}`,
        `resultCode=${resultCode}`,
        `transId=${transId}`,
    ].join('&');

    const expectedSignature = crypto
        .createHmac('sha256', MOMO_CONFIG.secretKey)
        .update(rawSignature)
        .digest('hex');

    return signature === expectedSignature;
}

/**
 * Check if payment was successful
 * @param {number} resultCode - MoMo result code
 * @returns {boolean}
 */
export function isMoMoPaymentSuccess(resultCode) {
    return resultCode === 0;
}

/**
 * Get MoMo result message
 * @param {number} resultCode - MoMo result code
 * @returns {string}
 */
export function getMoMoResultMessage(resultCode) {
    const messages = {
        0: 'Thành công',
        9000: 'Giao dịch đã được xác nhận thành công',
        8000: 'Giao dịch đang được xử lý',
        7000: 'Giao dịch đang được xử lý',
        1001: 'Giao dịch thanh toán thất bại do tài khoản người dùng không đủ tiền',
        1002: 'Giao dịch bị từ chối do nhà phát hành tài khoản thanh toán',
        1003: 'Giao dịch bị hủy',
        1004: 'Giao dịch thất bại do số tiền thanh toán vượt quá hạn mức thanh toán của người dùng',
        1005: 'Giao dịch thất bại do url hoặc QR code đã hết hạn',
        1006: 'Giao dịch thất bại do người dùng đã từ chối xác nhận thanh toán',
        1007: 'Giao dịch bị từ chối vì tài khoản người dùng đang ở trạng thái tạm khóa',
        1017: 'Giao dịch bị hủy bởi người dùng',
        1026: 'Giao dịch bị hạn chế theo thể lệ chương trình khuyến mãi',
        1080: 'Giao dịch hoàn tiền bị từ chối',
        1081: 'Giao dịch hoàn tiền bị từ chối do đã vượt quá thời gian cho phép',
        2001: 'Giao dịch thất bại do sai thông tin liên kết',
        2007: 'Giao dịch thất bại do liên kết đã bị hủy',
        3001: 'Liên kết thất bại do người dùng từ chối xác nhận',
        3002: 'Liên kết bị từ chối do không thỏa mãn quy tắc liên kết',
        3003: 'Hủy liên kết bị từ chối do đã vượt quá số lần hủy',
        3004: 'Liên kết này không thể hủy do có giao dịch đang chờ xử lý',
        4001: 'Giao dịch bị hạn chế do người dùng chưa hoàn tất xác thực tài khoản',
        4010: 'Quá trình xác minh OTP thất bại',
        4011: 'OTP chưa được gửi hoặc hết hạn',
        4100: 'Giao dịch thất bại do người dùng không đăng nhập thành công',
        4015: 'Quá trình xác minh 3DS thất bại',
        10: 'Hệ thống đang được bảo trì',
        99: 'Lỗi không xác định',
    };

    return messages[resultCode] || `Lỗi không xác định (${resultCode})`;
}
