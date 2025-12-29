"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function MoMoCallbackInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState('loading');
    const [orderInfo, setOrderInfo] = useState(null);

    useEffect(() => {
        const resultCode = searchParams.get('resultCode');
        const orderId = searchParams.get('orderId');
        const message = searchParams.get('message');
        const transId = searchParams.get('transId');
        const amount = searchParams.get('amount');

        if (resultCode === '0') {
            setStatus('success');
            setOrderInfo({ orderId, transId, amount: parseInt(amount) });
        } else {
            setStatus('failed');
            setOrderInfo({ orderId, message, resultCode });
        }
    }, [searchParams]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Đang xử lý thanh toán...</p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    {/* Success Icon */}
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
                    <p className="text-gray-600 mb-6">Cảm ơn bạn đã mua hàng tại BookStore</p>

                    {/* Order Info */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                        <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-500">Mã đơn hàng</span>
                            <span className="font-medium text-gray-900">#{orderInfo?.orderId?.slice(-8).toUpperCase()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-200">
                            <span className="text-gray-500">Mã giao dịch MoMo</span>
                            <span className="font-medium text-gray-900">{orderInfo?.transId}</span>
                        </div>
                        <div className="flex justify-between py-2">
                            <span className="text-gray-500">Số tiền</span>
                            <span className="font-bold text-pink-600">
                                {orderInfo?.amount?.toLocaleString('vi-VN')} đ
                            </span>
                        </div>
                    </div>

                    {/* MoMo Logo */}
                    <div className="flex items-center justify-center gap-2 mb-6 text-pink-600">
                        <span className="text-2xl">💳</span>
                        <span className="font-bold">MoMo</span>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Link
                            href={`/orders/${orderInfo?.orderId}`}
                            className="block w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            Xem chi tiết đơn hàng
                        </Link>
                        <Link
                            href="/"
                            className="block w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                        >
                            Tiếp tục mua sắm
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Failed status
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                {/* Failed Icon */}
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thất bại</h1>
                <p className="text-gray-600 mb-6">
                    {orderInfo?.message || 'Đã có lỗi xảy ra trong quá trình thanh toán'}
                </p>

                {/* Order Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
                    <div className="flex justify-between py-2">
                        <span className="text-gray-500">Mã đơn hàng</span>
                        <span className="font-medium text-gray-900">#{orderInfo?.orderId?.slice(-8).toUpperCase()}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Link
                        href={`/orders/${orderInfo?.orderId}`}
                        className="block w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                    >
                        Xem đơn hàng & Thử lại
                    </Link>
                    <Link
                        href="/"
                        className="block w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                    >
                        Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function MoMoCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full"></div>
            </div>
        }>
            <MoMoCallbackInner />
        </Suspense>
    );
}
