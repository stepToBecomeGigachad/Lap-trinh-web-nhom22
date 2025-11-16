"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './AuthStatus.module.css';

export default function AuthStatus() {
  const [state, setState] = useState({ loading: true, loggedIn: false });

  const refresh = async () => {
    try {
      const res = await fetch('/api/me', { cache: 'no-store' });
      const data = await res.json();
      setState({ loading: false, ...data });
    } catch {
      setState({ loading: false, loggedIn: false });
    }
  };

  useEffect(() => { refresh(); }, []);

  const onLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    refresh();
    if (typeof window !== 'undefined') window.location.href = '/';
  };

  // Render Login/Register ngay từ đầu để không trống khi SSR/hydration
  if (state.loading) {
    return (
      <div className={styles.stack}>
        <Link href="/login" className={`${styles.btn}`}>Login</Link>
        <Link href="/register" className={`${styles.btn} ${styles.btnPrimary}`}>Register</Link>
      </div>
    );
  }

  if (!state.loggedIn) {
    return (
      <div className={styles.stack}>
        <Link href="/login" className={`${styles.btn}`}>Login</Link>
        <Link href="/register" className={`${styles.btn} ${styles.btnPrimary}`}>Register</Link>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <Link href="/personal" className={styles.btn}>Personal</Link>
      <button onClick={onLogout} className={`${styles.btn}`}>Logout</button>
    </div>
  );
}
