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
    <>
      <button onClick={()=>useCartStore.getState().setOpen(true)} style={{ border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 8 }}>
        Cart ({totalItems})
      </button>
      <CartDrawer />
    </>
  );
}
