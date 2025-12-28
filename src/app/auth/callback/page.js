"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Suspense } from 'react';

function AuthCallbackInner() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session, status } = useSession();
    const [error, setError] = useState('');

    useEffect(() => {
        const syncSession = async () => {
            if (status === 'loading') return;

            if (status === 'authenticated' && session?.user) {
                try {
                    // Sync NextAuth session to custom JWT cookie
                    const res = await fetch('/api/auth/sync-session', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            email: session.user.email,
                            name: session.user.name,
                            role: session.user.role || 'user',
                        }),
                    });

                    if (res.ok) {
                        const callbackUrl = searchParams.get('callbackUrl') || '/';
                        router.replace(callbackUrl);
                    } else {
                        setError('Không thể đồng bộ phiên đăng nhập');
                    }
                } catch (err) {
                    console.error('Sync session error:', err);
                    setError('Có lỗi xảy ra');
                }
            } else if (status === 'unauthenticated') {
                router.replace('/login');
            }
        };

        syncSession();
    }, [session, status, router, searchParams]);

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-center">
                    <div className="text-red-500 text-xl mb-4">❌ {error}</div>
                    <a href="/login" className="text-blue-400 hover:underline">Quay lại đăng nhập</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-white text-lg">Đang xử lý đăng nhập...</p>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        }>
            <AuthCallbackInner />
        </Suspense>
    );
}
