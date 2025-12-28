"use client";
import Link from 'next/link';
import { useCartStore } from '../store/cart';
import dynamic from 'next/dynamic';
const CartDrawer = dynamic(() => import('./CartDrawer'), { ssr: false });
import { useEffect, useState } from 'react';

export default function CartStatus() {
  const totalItems = useCartStore((s) => s.totalItems());
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/me', { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled) setLoggedIn(Boolean(data?.loggedIn));
      } catch {
        if (!cancelled) setLoggedIn(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!loggedIn) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Cart Button */}
      <button
        onClick={() => useCartStore.getState().setOpen(true)}
        className="relative flex items-center gap-2 border-2 border-white/80 px-4 py-2 rounded-lg bg-transparent text-white cursor-pointer font-semibold transition-all hover:bg-white/10"
        style={{ minWidth: 'auto' }}
      >
        <span className="text-lg">🛒</span>
        <span className="hidden sm:inline">Giỏ hàng</span>
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {totalItems > 9 ? '9+' : totalItems}
          </span>
        )}
      </button>

      {/* Quick Checkout Button */}
      {totalItems > 0 && (
        <Link
          href="/checkout"
          className="hidden md:flex items-center gap-2 bg-white text-gray-900 px-4 py-2 rounded-lg font-semibold transition-all hover:bg-gray-100"
        >
          <span>💳</span>
          <span>Thanh toán</span>
        </Link>
      )}

      <CartDrawer />
    </div>
  );
}
