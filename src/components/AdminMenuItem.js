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
    <Link
      href="/manage"
      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl text-sm"
    >
      ⚙️ Quản trị
    </Link>
  );
}
