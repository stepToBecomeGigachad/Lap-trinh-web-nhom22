'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [validating, setValidating] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Password strength
    const [strength, setStrength] = useState({ score: 0, label: '', color: '' });

    useEffect(() => {
        const checkStrength = (pwd) => {
            let score = 0;
            if (pwd.length >= 8) score++;
            if (pwd.length >= 12) score++;
            if (/[A-Z]/.test(pwd)) score++;
            if (/[a-z]/.test(pwd)) score++;
            if (/[0-9]/.test(pwd)) score++;
            if (/[^A-Za-z0-9]/.test(pwd)) score++;

            if (score <= 2) return { score, label: 'Yếu', color: 'bg-red-500' };
            if (score <= 4) return { score, label: 'Trung bình', color: 'bg-yellow-500' };
            return { score, label: 'Mạnh', color: 'bg-green-500' };
        };
        setStrength(checkStrength(password));
    }, [password]);

    // Validate token on mount
    useEffect(() => {
        if (!token) {
            setValidating(false);
            setError('Link đặt lại mật khẩu không hợp lệ');
            return;
        }

        fetch(`/api/auth/reset-password?token=${token}`)
            .then(res => res.json())
            .then(data => {
                setValidating(false);
                if (data.valid) {
                    setTokenValid(true);
                } else {
                    setError(data.error || 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');
                }
            })
            .catch(() => {
                setValidating(false);
                setError('Không thể xác thực link');
            });
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }

        if (password.length < 8) {
            setError('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password, confirmPassword }),
            });

            const data = await res.json();

            if (data.ok) {
                setSuccess(true);
                setTimeout(() => router.push('/login'), 3000);
            } else {
                setError(data.error || 'Có lỗi xảy ra');
            }
        } catch (err) {
            setError('Không thể kết nối đến server');
        } finally {
            setLoading(false);
        }
    };

    // Loading state
    if (validating) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                </div>

                <div className="relative w-full max-w-md">
                    <div className="bg-white rounded-3xl shadow-2xl p-12 text-center">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Đang xác thực...</h2>
                        <p className="text-gray-500">Vui lòng đợi trong giây lát</p>
                    </div>
                </div>
            </div>
        );
    }

    // Invalid token state
    if (!tokenValid) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                </div>

                <div className="relative w-full max-w-md">
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-red-500 to-pink-600 p-8 text-center">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-5xl">🔗</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Link không hợp lệ</h1>
                        </div>

                        <div className="p-8 text-center">
                            <div className="mb-6">
                                <p className="text-red-600 font-medium mb-4">{error}</p>
                                <div className="bg-gray-50 rounded-xl p-4 text-left">
                                    <p className="text-gray-600 text-sm mb-2">Link có thể không hợp lệ vì:</p>
                                    <ul className="list-disc list-inside text-gray-500 text-sm space-y-1">
                                        <li>Link đã hết hạn (sau 1 giờ)</li>
                                        <li>Link đã được sử dụng</li>
                                        <li>Link bị copy không đầy đủ</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Link
                                    href="/forgot-password"
                                    className="block w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg text-center"
                                >
                                    Yêu cầu link mới
                                </Link>
                                <Link
                                    href="/login"
                                    className="block w-full py-4 border-2 border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-all text-center"
                                >
                                    Quay lại đăng nhập
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Success state
    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
                </div>

                <div className="relative w-full max-w-md">
                    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 text-center">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-5xl">🎉</span>
                            </div>
                            <h1 className="text-2xl font-bold text-white">Thành công!</h1>
                        </div>

                        <div className="p-8 text-center">
                            <div className="mb-6">
                                <p className="text-green-600 font-medium mb-2">
                                    Mật khẩu của bạn đã được đặt lại thành công!
                                </p>
                                <p className="text-gray-500 text-sm">
                                    Đang chuyển hướng đến trang đăng nhập...
                                </p>
                            </div>

                            <div className="flex justify-center mb-6">
                                <div className="w-10 h-10 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
                            </div>

                            <Link
                                href="/login"
                                className="block w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg text-center"
                            >
                                Đăng nhập ngay
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Reset form
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-5xl">
                <div className="grid md:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl bg-white">
                    {/* Left - Image */}
                    <div className="relative hidden md:block min-h-[550px]">
                        <img src="/images/intro.jpg" alt="reset password" className="absolute inset-0 h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-br from-green-600/90 to-blue-700/90"></div>
                        <div className="relative h-full p-8 flex flex-col justify-between text-white">
                            <Link href="/" className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl">
                                    📚
                                </div>
                                <span className="text-2xl font-bold">BookStore</span>
                            </Link>

                            <div>
                                <h2 className="text-3xl font-bold mb-4">Đặt lại mật khẩu</h2>
                                <p className="text-lg text-white/80 mb-6">
                                    Tạo mật khẩu mới an toàn cho tài khoản của bạn.
                                </p>
                                <div className="space-y-3">
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                        <div className="flex items-center gap-3 text-white/90">
                                            <span className="text-xl">✓</span>
                                            <span className="text-sm">Ít nhất 8 ký tự</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                        <div className="flex items-center gap-3 text-white/90">
                                            <span className="text-xl">✓</span>
                                            <span className="text-sm">Có chữ hoa, chữ thường và số</span>
                                        </div>
                                    </div>
                                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                                        <div className="flex items-center gap-3 text-white/90">
                                            <span className="text-xl">✓</span>
                                            <span className="text-sm">Có ký tự đặc biệt (khuyến khích)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right - Form */}
                    <div className="p-8 md:p-12">
                        <div className="mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 md:hidden">
                                <span className="text-3xl">🔐</span>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Đặt lại mật khẩu</h1>
                            <p className="text-gray-500">Nhập mật khẩu mới cho tài khoản của bạn</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
                                    <span className="text-xl">⚠️</span>
                                    <span className="font-medium">{error}</span>
                                </div>
                            )}

                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Mật khẩu mới
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔒</span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-0 text-gray-900 transition-colors"
                                        placeholder="Ít nhất 8 ký tự"
                                        required
                                        minLength={8}
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>

                                {/* Password strength indicator */}
                                {password && (
                                    <div className="mt-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full ${strength.color} transition-all`}
                                                    style={{ width: `${(strength.score / 6) * 100}%` }}
                                                ></div>
                                            </div>
                                            <span className={`text-xs font-medium ${strength.score <= 2 ? 'text-red-500' :
                                                    strength.score <= 4 ? 'text-yellow-500' : 'text-green-500'
                                                }`}>
                                                {strength.label}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Xác nhận mật khẩu
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔐</span>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className={`w-full pl-12 pr-12 py-4 rounded-xl border-2 transition-colors ${confirmPassword && confirmPassword !== password
                                                ? 'border-red-300 focus:border-red-500'
                                                : confirmPassword && confirmPassword === password
                                                    ? 'border-green-300 focus:border-green-500'
                                                    : 'border-gray-200 focus:border-blue-500'
                                            } focus:ring-0 text-gray-900`}
                                        placeholder="Nhập lại mật khẩu"
                                        required
                                        disabled={loading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirmPassword ? '🙈' : '👁️'}
                                    </button>
                                </div>
                                {confirmPassword && confirmPassword !== password && (
                                    <p className="mt-1 text-sm text-red-500">Mật khẩu không khớp</p>
                                )}
                                {confirmPassword && confirmPassword === password && (
                                    <p className="mt-1 text-sm text-green-500">✓ Mật khẩu khớp</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || password !== confirmPassword || password.length < 8}
                                className="w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Đang xử lý...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Đặt lại mật khẩu</span>
                                        <span>→</span>
                                    </>
                                )}
                            </button>

                            <div className="text-center pt-4">
                                <Link href="/login" className="text-gray-500 hover:text-gray-700">
                                    ← Quay lại đăng nhập
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    );
}
