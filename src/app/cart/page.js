"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '../../store/cart';
import { calculateShippingFee, formatPrice } from '../../lib/utils';

// Toast notification component
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg ${type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-gray-800'
      } text-white`} style={{ animation: 'slideUp 0.3s ease-out' }}>
      <span className="text-xl">{type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span>
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">✕</button>
    </div>
  );
}

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.totalPrice());
  const [toast, setToast] = useState(null);
  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const shippingFee = calculateShippingFee(totalQuantity);
  const finalTotal = totalPrice + (items.length ? shippingFee : 0);

  const handleRemove = (id, name) => {
    removeItem(id);
    setToast({ message: `Đã xóa "${name}" khỏi giỏ hàng`, type: 'success' });
  };

  const handleClearCart = () => {
    clearCart();
    setToast({ message: 'Đã xóa tất cả sản phẩm', type: 'success' });
  };

  if (!items.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-6 px-4">
        {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        <div className="text-8xl">🛒</div>
        <h1 className="text-2xl font-bold text-gray-900">Giỏ hàng trống</h1>
        <p className="text-gray-500 text-center max-w-md">Bạn chưa có sản phẩm nào trong giỏ hàng. Hãy khám phá các sản phẩm tuyệt vời của chúng tôi!</p>
        <Link href="/products" className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
          🛍️ Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center gap-2 text-sm mb-2">
                <Link href="/" className="text-gray-500 hover:text-gray-700">Trang chủ</Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-900 font-medium">Giỏ hàng</span>
              </nav>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Giỏ hàng của bạn</h1>
              <p className="text-gray-500 mt-1">{items.length} sản phẩm</p>
            </div>
            {items.length > 0 && (
              <button
                onClick={handleClearCart}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
              >
                🗑️ Xóa tất cả
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => {
              const stockWarning = item.stock && item.quantity > item.stock;
              const lowStock = item.stock && item.stock <= 5 && item.stock > 0;

              return (
                <div key={item.id} className="bg-white rounded-2xl shadow-sm p-6 transition-all hover:shadow-md">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <Link href={`/products/${item.slug}`} className="flex-shrink-0">
                      <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-gray-100">
                        <Image
                          src={item.image || '/images/placeholder.jpg'}
                          alt={item.name}
                          fill
                          className="object-cover hover:scale-105 transition-transform"
                        />
                      </div>
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/products/${item.slug}`} className="block">
                        <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate">{item.name}</h3>
                      </Link>

                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-900">{formatPrice(item.price)}</span>
                      </div>

                      {/* Stock status */}
                      {item.stock !== undefined && (
                        <div className="mt-2">
                          {stockWarning ? (
                            <span className="text-red-600 text-sm font-medium">⚠️ Vượt quá số lượng tồn kho ({item.stock})</span>
                          ) : lowStock ? (
                            <span className="text-amber-600 text-sm font-medium">Chỉ còn {item.stock} sản phẩm</span>
                          ) : (
                            <span className="text-green-600 text-sm font-medium">✓ Còn hàng</span>
                          )}
                        </div>
                      )}

                      {/* Quantity & Actions - Mobile */}
                      <div className="mt-4 flex items-center justify-between lg:hidden">
                        <div className="flex items-center border border-gray-300 rounded-lg">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                          >
                            −
                          </button>
                          <span className="w-12 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.stock ? Math.min(item.stock, item.quantity + 1) : item.quantity + 1)}
                            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => handleRemove(item.id, item.name)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {/* Quantity & Actions - Desktop */}
                    <div className="hidden lg:flex flex-col items-end gap-4">
                      <button
                        onClick={() => handleRemove(item.id, item.name)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        ✕
                      </button>

                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg transition-colors"
                        >
                          −
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.stock ? Math.min(item.stock, item.quantity + 1) : item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-500">Thành tiền</div>
                        <div className="text-lg font-bold text-gray-900">{formatPrice(item.price * item.quantity)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>

              <div className="space-y-4">
                <div className="flex justify-between text-gray-600">
                  <span>Tạm tính ({totalQuantity} sản phẩm)</span>
                  <span className="font-medium">{formatPrice(totalPrice)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="text-gray-900 font-medium">{formatPrice(items.length ? shippingFee : 0)}</span>
                </div>

                <hr className="border-gray-200" />

                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Tổng cộng</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="mt-6 w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2"
              >
                Tiến hành thanh toán →
              </Link>

              <Link
                href="/products"
                className="mt-3 w-full py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              >
                ← Tiếp tục mua sắm
              </Link>

              {/* Security badges */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                  <span>🔒</span>
                  <span>Thanh toán an toàn & bảo mật</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <span>🚚</span>
                  <span>Giao hàng nhanh toàn quốc</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
