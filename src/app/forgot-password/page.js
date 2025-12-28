'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (data.ok) {
                setSubmitted(true);
            } else {
                setError(data.error || 'Có lỗi xảy ra');
            }
        } catch (err) {
            setError('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    // Success state
    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
                {/* Background decoration */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                </div>

                <div className="relative w-full max-w-md">
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-5xl">✉️</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Kiểm tra email!</h1>
                        </div>

                        {/* Content */}
                        <div className="p-8 text-center">
                            <div className="mb-6">
                                <p className="text-gray-600 mb-4">
                                    Nếu email <span className="font-semibold text-gray-900">{email}</span> tồn tại trong hệ thống,
                                    bạn sẽ nhận được link đặt lại mật khẩu trong vài phút.
                                </p>
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-left">
                                    <div className="flex gap-3">
                                        <span className="text-amber-500 text-xl">💡</span>
                                        <div className="text-sm text-amber-800">
                                            <p className="font-semibold mb-1">Không thấy email?</p>
                                            <ul className="list-disc list-inside space-y-1 text-amber-700">
                                                <li>Kiểm tra thư mục <strong>Spam/Junk</strong></li>
                                                <li>Đợi 1-2 phút và refresh inbox</li>
                                                <li>Đảm bảo email nhập đúng</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Link
                                    href="/login"
                                    className="block w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg hover:shadow-xl text-center"
                                >
                                    ← Quay lại đăng nhập
                                </Link>
                                <button
                                    onClick={() => setSubmitted(false)}
                                    className="block w-full py-4 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all text-center"
                                >
                                    Gửi lại email
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-5xl">
                <div className="grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl bg-white">
                    {/* Left - Image */}
                    <div className="relative hidden md:block min-h-[500px]">
                        <img src="/images/intro.jpg" alt="forgot password" className="absolute inset-0 h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 to-blue-700/90"></div>
                        <div className="relative h-full p-8 flex flex-col justify-between text-white">
                            <Link href="/" className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl">
                                    📚
                                </div>
                                <span className="text-2xl font-bold">BookStore</span>
                            </Link>

                            <div>
                                <h2 className="text-3xl font-bold mb-4">Quên mật khẩu?</h2>
                                <p className="text-lg text-white/80 mb-6">
                                    Đừng lo lắng! Chúng tôi sẽ giúp bạn lấy lại quyền truy cập vào tài khoản.
                                </p>
                                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                    <div className="flex items-center gap-3 text-white/90">
                                        <span className="text-2xl">🔒</span>
                                        <span className="text-sm">Link đặt lại mật khẩu sẽ hết hạn sau 1 giờ</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Form */}
                    <div className="p-8 md:p-12">
                        <div className="mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 md:hidden">
                                <span className="text-3xl">🔐</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quên mật khẩu</h1>
                            <p className="text-gray-500">Nhập email để nhận link đặt lại mật khẩu</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                                    <span className="text-xl">⚠️</span>
                                    <span className="font-medium">{error}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Email đăng ký
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">📧</span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 text-gray-900 transition-colors"
                                        placeholder="email@example.com"
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Đang gửi...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Gửi link đặt lại mật khẩu</span>
                                        <span>→</span>
                                    </>
                                )}
                            </button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-gray-500">hoặc</span>
                                </div>
                            </div>

                            <div className="text-center space-y-4">
                                <Link
                                    href="/login"
                                    className="block w-full py-4 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                                >
                                    ← Quay lại đăng nhập
                                </Link>

                                <p className="text-gray-500 text-sm">
                                    Chưa có tài khoản?{' '}
                                    <Link href="/register" className="text-blue-600 font-semibold hover:underline">
                                        Đăng ký ngay
                                    </Link>
                                </p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
