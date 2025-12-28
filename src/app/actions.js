'use server';

import { signIn } from '../auth';

export async function signInWithGoogle(callbackUrl = '/') {
    // Redirect to callback page which will sync session to custom JWT
    const syncCallbackUrl = `/auth/callback?callbackUrl=${encodeURIComponent(callbackUrl)}`;
    await signIn('google', { redirectTo: syncCallbackUrl });
}

export async function signInWithCredentials(email, password) {
    try {
        await signIn('credentials', {
            email,
            password,
            redirect: false,
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Đăng nhập thất bại' };
    }
}
