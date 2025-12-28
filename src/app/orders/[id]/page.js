"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { formatPrice } from '../../../lib/utils';

// Toast notification component
function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
            } text-white max-w-md`} style={{ animation: 'slideUp 0.3s ease-out' }}>
            <span className="text-xl">{type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
            <span className="font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-70">✕</button>
        </div>
    );
}

export default function OrderDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const orderId = params?.id;
    const isSuccess = searchParams?.get('success') === '1';

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);

    useEffect(() => {
        if (isSuccess) {
            setToast({ message: '🎉 Đặt hàng thành công! Cảm ơn bạn đã mua hàng.', type: 'success' });
        }
    }, [isSuccess]);

    useEffect(() => {
        if (!orderId) return;
        (async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/orders/${orderId}`);
                if (res.ok) {
                    const data = await res.json();
                    setOrder(data);
                }
            } catch (err) {
                console.error('Error fetching order:', err);
            }
            setLoading(false);
        })();
    }, [orderId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-pulse text-gray-500">Đang tải...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 px-4">
                <div className="text-6xl">📦</div>
                <h1 className="text-2xl font-bold text-gray-900">Không tìm thấy đơn hàng</h1>
                <p className="text-gray-500">Đơn hàng này không tồn tại hoặc bạn không có quyền xem.</p>
                <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                    Về trang chủ
                </Link>
            </div>
        );
    }

    const statusColors = {
        pending: 'bg-amber-100 text-amber-700',
        processing: 'bg-blue-100 text-blue-700',
        shipped: 'bg-purple-100 text-purple-700',
        completed: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700'
    };

    const statusLabels = {
        pending: 'Đang chờ xử lý',
        processing: 'Đang xử lý',
        shipped: 'Đang giao hàng',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy'
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {toast && <Toast {...toast} onClose={() => setToast(null)} />}

            {/* Success Banner */}
            {isSuccess && (
                <div className="bg-green-600 text-white py-4">
                    <div className="max-w-4xl mx-auto px-4 flex items-center justify-center gap-3">
                        <span className="text-2xl">🎉</span>
                        <span className="font-semibold">Đặt hàng thành công! Cảm ơn bạn đã mua hàng.</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <nav className="flex items-center gap-2 text-sm mb-2">
                        <Link href="/" className="text-gray-500 hover:text-gray-700">Trang chủ</Link>
                        <span className="text-gray-400">/</span>
                        <Link href="/personal" className="text-gray-500 hover:text-gray-700">Tài khoản</Link>
                        <span className="text-gray-400">/</span>
                        <span className="text-gray-900 font-medium">Đơn hàng #{orderId}</span>
                    </nav>
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Chi tiết đơn hàng</h1>
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                            {statusLabels[order.status] || order.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
                {/* Order Info */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin đơn hàng</h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <div className="text-sm text-gray-500">Mã đơn hàng</div>
                            <div className="font-semibold text-gray-900">#{orderId}</div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Ngày đặt</div>
                            <div className="font-semibold text-gray-900">
                                {order.createdAt ? new Date(order.createdAt).toLocaleDateString('vi-VN') : '-'}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Phương thức thanh toán</div>
                            <div className="font-semibold text-gray-900">
                                {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản'}
                            </div>
                        </div>
                        <div>
                            <div className="text-sm text-gray-500">Tổng tiền</div>
                            <div className="font-bold text-blue-600 text-lg">{formatPrice(order.total)}</div>
                        </div>
                    </div>
                </div>

                {/* Shipping Info */}
                {order.shipping && (
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin giao hàng</h2>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <div className="text-sm text-gray-500">Người nhận</div>
                                <div className="font-semibold text-gray-900">{order.shipping.name}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-500">Số điện thoại</div>
                                <div className="font-semibold text-gray-900">{order.shipping.phone}</div>
                            </div>
                            <div className="sm:col-span-2">
                                <div className="text-sm text-gray-500">Địa chỉ</div>
                                <div className="font-semibold text-gray-900">
                                    {order.shipping.address}, {order.shipping.district}, {order.shipping.city}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Order Items */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Sản phẩm đã đặt</h2>
                    <div className="space-y-4">
                        {order.items?.map((item, idx) => (
                            <div key={idx} className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
                                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                    {item.product?.image && (
                                        <Image src={item.product.image} alt={item.product?.name || 'Product'} fill className="object-cover" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium text-gray-900">{item.product?.name || 'Sản phẩm'}</div>
                                    <div className="text-sm text-gray-500">Số lượng: {item.quantity}</div>
                                    <div className="text-sm text-gray-500">Đơn giá: {formatPrice(item.price)}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Total */}
                    <div className="mt-6 pt-4 border-t border-gray-200">
                        <div className="flex justify-between text-gray-600 mb-2">
                            <span>Tạm tính</span>
                            <span>{formatPrice(order.total)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600 mb-2">
                            <span>Phí vận chuyển</span>
                            <span className="text-green-600">Miễn phí</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
                            <span>Tổng cộng</span>
                            <span className="text-blue-600">{formatPrice(order.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/products"
                        className="flex-1 py-4 bg-blue-600 text-white rounded-xl font-semibold text-center hover:bg-blue-700 transition-colors"
                    >
                        Tiếp tục mua sắm
                    </Link>
                    <Link
                        href="/personal"
                        className="flex-1 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold text-center hover:bg-gray-50 transition-colors"
                    >
                        Xem tất cả đơn hàng
                    </Link>
                </div>
            </div>
        </div>
    );
}
