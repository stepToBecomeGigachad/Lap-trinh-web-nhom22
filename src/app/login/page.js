"use client";
import { Suspense, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const redirect = search.get('redirect') || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    startTransition(async () => {
      const res = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Đăng nhập thất bại');
        return;
      }
      router.replace(redirect);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-6">
      <div className="grid w-full max-w-5xl rounded-2xl overflow-hidden shadow-xl grid-cols-1 md:grid-cols-2 bg-white dark:bg-gray-900">
        <div className="relative hidden md:block">
          <img src="/images/intro.jpg" alt="auth" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative h-full p-6 flex flex-col justify-between text-white">
            <div className="text-xl font-bold">AMU</div>
            <p className="text-lg opacity-90">Capturing Moments, Creating Memories</p>
          </div>
        </div>
        <div className="p-8 md:p-10">
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-white/90 mb-2">Đăng nhập</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Sử dụng tài khoản admin để truy cập trang quản trị.</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input type="email" className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-brand-500 focus:border-brand-500" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mật khẩu</label>
              <input type="password" className="w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-brand-500 focus:border-brand-500" placeholder="Mật khẩu" value={password} onChange={(e)=>setPassword(e.target.value)} required />
            </div>
            {error ? <div className="text-error-500 text-sm">{error}</div> : null}
            <button type="submit" disabled={isPending} className="w-full rounded-lg bg-brand-500 hover:bg-brand-600 text-white py-3 shadow-theme-xs">{isPending? 'Đang xử lý...':'Đăng nhập'}</button>
            <div className="text-sm text-gray-500">Demo: admin@test.com / test.123</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Chưa có tài khoản? <a href="/register" className="text-brand-500 hover:text-brand-600">Đăng ký</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
