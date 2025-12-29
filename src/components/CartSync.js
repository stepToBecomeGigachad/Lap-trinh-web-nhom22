"use client";

import { useEffect, useRef, useState } from 'react';
import { useCartStore } from '../store/cart';

const mapServerItem = (item) => ({
  id: item.product?.slug || item.product?.id || item.id,
  slug: item.product?.slug || '',
  name: item.product?.name || 'Sản phẩm',
  image: item.product?.image || '',
  price: item.priceAtSave ?? item.product?.salePrice ?? item.product?.price ?? 0,
  quantity: item.quantity || 1,
});

const mapClientItems = (items) =>
  items.map((item) => ({
    slug: item.slug || item.id,
    quantity: item.quantity || 1,
  }));

export default function CartSync() {
  const items = useCartStore((s) => s.items);
  const setItems = useCartStore((s) => s.setItems);
  const [ready, setReady] = useState(false);
  const skipNextSave = useRef(false);
  const loggedIn = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/cart', { cache: 'no-store' });
        if (!res.ok) {
          setReady(true);
          return;
        }

        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        loggedIn.current = true;

        const serverItems = (data?.cart?.items || []).map(mapServerItem);
        if (serverItems.length > 0) {
          setItems(serverItems);
          skipNextSave.current = true;
        } else {
          const currentItems = useCartStore.getState().items;
          if (currentItems.length === 0) return;
          await fetch('/api/cart', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: mapClientItems(currentItems) }),
          });
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !loggedIn.current) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: mapClientItems(items) }),
      }).catch(() => null);
    }, 600);

    return () => clearTimeout(timer);
  }, [items, ready]);

  return null;
}
