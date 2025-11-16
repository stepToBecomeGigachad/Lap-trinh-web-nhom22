"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminMenuItem() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/me', { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled) setIsAdmin(Boolean(data?.loggedIn) && data?.role === 'admin');
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (!isAdmin) return null;
  return (
    <li><Link href="/manage">Admin</Link></li>
  );
}
