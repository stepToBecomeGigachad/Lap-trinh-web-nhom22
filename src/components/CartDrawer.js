"use client";
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '../store/cart';
import { useEffect, useState } from 'react';
import { calculateShippingFee, formatPrice } from '../lib/utils';

export default function CartDrawer() {
  const { items, isOpen, setOpen, removeItem, updateQuantity, totalPrice } = useCartStore((s) => ({
    items: s.items,
    isOpen: s.isOpen,
    setOpen: s.setOpen,
    removeItem: s.removeItem,
    updateQuantity: s.updateQuantity,
    totalPrice: s.totalPrice,
  }));

  if (!isOpen) return null;

  const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const shippingFee = calculateShippingFee(totalQuantity);
  const subtotal = totalPrice();
  const finalTotal = subtotal + (items.length ? shippingFee : 0);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={() => setOpen(false)}
        className="fixed inset-0 bg-black/50 z-[1000] backdrop-blur-sm transition-opacity"
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 bottom-0 w-[400px] max-w-[90vw] bg-white z-[1001] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white">
              🛒
            </div>
            <div>
              <h2 className="font-bold text-gray-900">Giỏ hàng</h2>
              <p className="text-sm text-gray-500">{items.length} sản phẩm</p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-5xl mb-6">
              🛒
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Giỏ hàng trống</h3>
            <p className="text-gray-500 mb-6">Hãy thêm sản phẩm vào giỏ hàng của bạn</p>
            <Link
              href="/products"
              onClick={() => setOpen(false)}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              Xem sản phẩm
            </Link>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-1 overflow-auto p-4 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bg-gray-50 rounded-2xl p-4 flex gap-4 hover:bg-gray-100 transition-colors group"
                >
                  {/* Image */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-white flex-shrink-0 shadow-sm">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">📚</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">{item.name}</h4>
                    <div className="text-lg font-bold text-blue-600">{formatPrice(item.price)}</div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-8 h-8 rounded-lg text-gray-400 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                    >
                      🗑️
                    </button>

                    <div className="flex items-center gap-1 bg-white rounded-xl shadow-sm">
                      <button
                        onClick={() => useCartStore.getState().updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="w-8 h-8 rounded-l-xl hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => useCartStore.getState().updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-r-xl hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-100 p-4 bg-gradient-to-r from-gray-50 to-white">
              {/* Summary */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Tạm tính ({totalQuantity} sản phẩm)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium">{formatPrice(items.length ? shippingFee : 0)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Tổng cộng</span>
                  <span className="text-blue-600">{formatPrice(finalTotal)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg"
                >
                  Thanh toán
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center w-full py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Xem giỏ hàng
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
