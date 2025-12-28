"use client";
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AuthStatus() {
  const [state, setState] = useState({ loading: true, loggedIn: false });
  const [showDropdown, setShowDropdown] = useState(false);

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

  // Loading state
  if (state.loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="w-20 h-9 bg-gray-700/50 rounded-lg animate-pulse"></div>
        <div className="w-24 h-9 bg-blue-600/50 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  // Not logged in
  if (!state.loggedIn) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors"
        >
          Đăng nhập
        </Link>
        <Link
          href="/register"
          className="px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl"
        >
          Đăng ký
        </Link>
      </div>
    );
  }

  // Logged in - show dropdown
  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-800/50 hover:bg-gray-700/50 transition-colors border border-gray-700"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-sm font-bold">
          {state.name ? state.name.charAt(0).toUpperCase() : '👤'}
        </div>
        <span className="hidden sm:block text-white font-medium max-w-24 truncate">
          {state.name || 'Tài khoản'}
        </span>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)}></div>
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl z-50 border border-gray-100 overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
              <div className="font-semibold text-gray-900">{state.name || 'Người dùng'}</div>
              <div className="text-sm text-gray-500">{state.email}</div>
            </div>
            <div className="py-2">
              <Link
                href="/personal"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors"
              >
                <span className="text-xl">👤</span>
                <span>Tài khoản của tôi</span>
              </Link>
              <Link
                href="/personal#orders"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors"
              >
                <span className="text-xl">📦</span>
                <span>Đơn hàng</span>
              </Link>
              <hr className="my-2 border-gray-100" />
              <button
                onClick={() => { setShowDropdown(false); onLogout(); }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 w-full transition-colors"
              >
                <span className="text-xl">🚪</span>
                <span>Đăng xuất</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
