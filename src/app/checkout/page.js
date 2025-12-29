"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '../../store/cart';
import { calculateShippingFee, formatPrice } from '../../lib/utils';

// Toast notification component
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-gray-800'
      } text-white max-w-md`} style={{ animation: 'slideUp 0.3s ease-out' }}>
      <span className="text-xl">{type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">✕</button>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore(s => s.items);
  const clearCart = useCartStore(s => s.clearCart);
  const total = useCartStore(s => s.totalPrice());
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', address: '', city: '', district: '', note: '' });
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');

  // Coupon states
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Calculate total quantity
  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

  const shippingFee = calculateShippingFee(totalQuantity);

  // Calculate final total with discount and shipping
  const discountAmount = appliedCoupon?.discountAmount || 0;
  const finalTotal = total - discountAmount + shippingFee;

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/me');
        const d = await r.json();
        setMe(d);
        // Pre-fill form if user data available
        if (d?.loggedIn && d?.user) {
          setForm(prev => ({
            ...prev,
            name: d.user.name || prev.name,
            phone: d.user.phone || prev.phone,
            address: d.user.address || prev.address
          }));
        }
      } catch { }
    })();
  }, []);

  useEffect(() => {
    if (!items?.length) router.replace('/cart');
  }, [items, router]);

  // Apply coupon handler
  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Vui lòng nhập mã giảm giá');
      return;
    }
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(couponCode)}&total=${total}`);
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setCouponError(data.error || 'Mã giảm giá không hợp lệ');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data.coupon);
        setCouponError('');
        setToast({ message: `Áp dụng mã "${data.coupon.code}" thành công!`, type: 'success' });
      }
    } catch {
      setCouponError('Lỗi kết nối');
    }
    setCouponLoading(false);
  };

  // Remove coupon handler
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!items?.length) return;

    // Validate form
    if (!form.name.trim() || !form.phone.trim() || !form.address.trim() || !form.city.trim() || !form.district.trim()) {
      setToast({ message: 'Vui lòng điền đầy đủ thông tin giao hàng', type: 'error' });
      return;
    }

    // Validate phone number
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phoneRegex.test(form.phone.replace(/\s/g, ''))) {
      setToast({ message: 'Số điện thoại không hợp lệ', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        items: items.map(i => ({ slug: i.slug || i.id, quantity: i.quantity })),
        shipping: { name: form.name, phone: form.phone, address: form.address, city: form.city, district: form.district },
        note: form.note,
        paymentMethod,
        couponCode: appliedCoupon?.code || null,
      };
      const res = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.ok) {
        setToast({ message: data?.error || 'Không thể tạo đơn hàng. Vui lòng thử lại.', type: 'error' });
        setSubmitting(false);
        return;
      }

      // If payment method is MoMo, redirect to MoMo payment
      if (paymentMethod === 'momo') {
        setToast({ message: 'Đang chuyển đến MoMo...', type: 'info' });

        const momoRes = await fetch('/api/payment/momo/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId: data.id }),
        });
        const momoData = await momoRes.json();

        if (momoData.ok && momoData.payUrl) {
          clearCart();
          window.location.href = momoData.payUrl;
          return;
        } else {
          setToast({ message: momoData.error || 'Không thể kết nối MoMo', type: 'error' });
          setSubmitting(false);
          return;
        }
      }

      // COD - just complete the order
      clearCart();
      router.replace(`/orders/${data.id}?success=1`);
    } catch (err) {
      setToast({ message: 'Lỗi kết nối. Vui lòng thử lại sau.', type: 'error' });
      setSubmitting(false);
    }
  };

  if (!items?.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Đang chuyển hướng...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <nav className="flex items-center gap-2 text-sm mb-2">
            <Link href="/" className="text-gray-500 hover:text-gray-700">Trang chủ</Link>
            <span className="text-gray-400">/</span>
            <Link href="/cart" className="text-gray-500 hover:text-gray-700">Giỏ hàng</Link>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Thanh toán</span>
          </nav>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Thanh toán đơn hàng</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={onSubmit} className="space-y-6">
              {/* Shipping Info */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                  Thông tin giao hàng
                </h2>

                <div className="grid gap-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên người nhận *</label>
                      <input
                        placeholder="Nguyễn Văn A"
                        value={form.name}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại *</label>
                      <input
                        placeholder="0912345678"
                        value={form.phone}
                        onChange={e => setForm({ ...form, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết *</label>
                    <input
                      placeholder="Số nhà, tên đường, phường/xã"
                      value={form.address}
                      onChange={e => setForm({ ...form, address: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố *</label>
                      <input
                        placeholder="Hà Nội"
                        value={form.city}
                        onChange={e => setForm({ ...form, city: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện *</label>
                      <input
                        placeholder="Ba Đình"
                        value={form.district}
                        onChange={e => setForm({ ...form, district: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú (tùy chọn)</label>
                    <textarea
                      placeholder="Ghi chú thêm về đơn hàng hoặc địa chỉ giao hàng..."
                      value={form.note}
                      onChange={e => setForm({ ...form, note: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                  Phương thức thanh toán
                </h2>

                <div className="space-y-3">
                  <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="w-5 h-5 text-blue-600"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">💵 Thanh toán khi nhận hàng (COD)</div>
                      <div className="text-sm text-gray-500">Thanh toán bằng tiền mặt khi nhận hàng</div>
                    </div>
                  </label>

                  <label className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${paymentMethod === 'momo' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-gray-300'
                    }`}>
                    <input
                      type="radio"
                      name="payment"
                      value="momo"
                      checked={paymentMethod === 'momo'}
                      onChange={() => setPaymentMethod('momo')}
                      className="w-5 h-5 text-pink-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <span className="text-pink-500 font-bold">📱 MoMo</span>
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Cần tài khoản Business</span>
                      </div>
                      <div className="text-sm text-gray-500">Thanh toán qua ví điện tử MoMo</div>
                    </div>
                  </label>

                </div>
              </div>

              {/* Submit Button - Mobile */}
              <div className="lg:hidden">
                <button
                  type="submit"
                  disabled={submitting}
                  className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${submitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : paymentMethod === 'momo'
                      ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-lg shadow-pink-500/30'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30'
                    }`}
                >
                  {submitting
                    ? '⏳ Đang xử lý...'
                    : paymentMethod === 'momo'
                      ? `Thanh toán MoMo - ${formatPrice(finalTotal)}`
                      : `Đặt hàng - ${formatPrice(finalTotal)}`
                  }
                </button>
              </div>
            </form>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Đơn hàng của bạn</h2>

              {/* Items */}
              <div className="space-y-4 max-h-64 overflow-y-auto mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex gap-3">
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{item.name}</div>
                      <div className="text-sm text-gray-500">{formatPrice(item.price)} × {item.quantity}</div>
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <hr className="border-gray-200 my-4" />

              {/* Coupon Code */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mã giảm giá</label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600">🎟️</span>
                      <div>
                        <span className="font-semibold text-green-700">{appliedCoupon.code}</span>
                        <div className="text-xs text-green-600">
                          {appliedCoupon.discountType === 'percent'
                            ? `Giảm ${appliedCoupon.discountValue}%`
                            : `Giảm ${formatPrice(appliedCoupon.discountValue)}`}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-red-500 hover:text-red-700 text-sm font-medium"
                    >
                      Xóa
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Nhập mã giảm giá"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm uppercase"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponLoading}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors text-sm disabled:opacity-50"
                    >
                      {couponLoading ? '...' : 'Áp dụng'}
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="mt-2 text-sm text-red-600">{couponError}</p>
                )}
              </div>

              {/* Totals */}
              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính</span>
                  <span className="font-medium">{formatPrice(total)}</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá</span>
                    <span className="font-medium">-{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển ({totalQuantity} sản phẩm)</span>
                  <span className="font-medium">{formatPrice(shippingFee)}</span>
                </div>

                <hr className="border-gray-200" />

                <div className="flex justify-between text-xl font-bold text-gray-900">
                  <span>Tổng cộng</span>
                  <span className="text-blue-600">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Submit Button - Desktop */}
              <button
                type="submit"
                form="checkout-form"
                onClick={onSubmit}
                disabled={submitting}
                className={`hidden lg:flex w-full mt-6 py-4 rounded-xl font-semibold text-lg transition-all items-center justify-center gap-2 ${submitting
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : paymentMethod === 'momo'
                    ? 'bg-pink-500 text-white hover:bg-pink-600 shadow-lg shadow-pink-500/30'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-600/30'
                  }`}
              >
                {submitting
                  ? '⏳ Đang xử lý...'
                  : paymentMethod === 'momo'
                    ? '📱 Thanh toán MoMo'
                    : '✓ Xác nhận đặt hàng'
                }
              </button>

              {/* Security note */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
                <div className="text-sm text-gray-500 flex items-center justify-center gap-2">
                  <span>🔒</span>
                  <span>Thông tin của bạn được bảo mật</span>
                </div>
              </div>

              <Link href="/cart" className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center justify-center gap-1">
                ← Quay lại giỏ hàng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
