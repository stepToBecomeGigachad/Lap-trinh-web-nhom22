import { NextResponse } from 'next/server';

/**
 * Rate Limit Configuration
 */
const CONFIG = {
    WINDOW_MS: 60 * 1000, // 1 minute window
    MAX_REQUESTS: {
        DEFAULT: 100,       // General API requests
        LOGIN: 5,           // Login attempts
        REGISTER: 3,        // Registration attempts
        SENSITIVE: 10,      // Sensitive operations (password change, etc.)
    },
};

/**
 * In-memory rate limit store
 * In production, use Redis or similar
 */
const rateLimitStore = new Map();

/**
 * Get client identifier from request
 */
function getClientKey(request) {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown';
    return ip;
}

/**
 * Clean up expired entries
 */
function cleanupExpiredEntries() {
    const now = Date.now();
    for (const [key, record] of rateLimitStore) {
        if (now > record.resetTime) {
            rateLimitStore.delete(key);
        }
    }
}

/**
 * Check rate limit for a key
 */
function checkLimit(key, maxRequests) {
    const now = Date.now();
    const record = rateLimitStore.get(key) || {
        count: 0,
        resetTime: now + CONFIG.WINDOW_MS
    };

    // Reset if window expired
    if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + CONFIG.WINDOW_MS;
    } else {
        record.count++;
    }

    rateLimitStore.set(key, record);

    // Periodic cleanup
    if (rateLimitStore.size > 10000) {
        cleanupExpiredEntries();
    }

    return {
        allowed: record.count <= maxRequests,
        remaining: Math.max(0, maxRequests - record.count),
        resetTime: record.resetTime,
    };
}

/**
 * Get rate limit type based on pathname
 */
function getRateLimitType(pathname) {
    if (pathname === '/api/login') return 'LOGIN';
    if (pathname === '/api/register') return 'REGISTER';
    if (pathname.includes('/password') || pathname.includes('/account/delete')) return 'SENSITIVE';
    return 'DEFAULT';
}

/**
 * Rate limiting middleware
 */
export function checkRateLimit(request) {
    const { pathname } = request.nextUrl;

    // Only apply to API routes
    if (!pathname.startsWith('/api/')) return null;

    const clientKey = getClientKey(request);
    const limitType = getRateLimitType(pathname);
    const maxRequests = CONFIG.MAX_REQUESTS[limitType];

    const { allowed, remaining, resetTime } = checkLimit(
        `${limitType}:${clientKey}`,
        maxRequests
    );

    if (!allowed) {
        const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);

        return NextResponse.json(
            {
                ok: false,
                error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
                retryAfter,
            },
            {
                status: 429,
                headers: {
                    'Retry-After': String(retryAfter),
                    'X-RateLimit-Limit': String(maxRequests),
                    'X-RateLimit-Remaining': '0',
                    'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
                },
            }
        );
    }

    return null;
}

/**
 * Add rate limit headers to response
 */
export function addRateLimitHeaders(response, request) {
    const { pathname } = request.nextUrl;
    if (!pathname.startsWith('/api/')) return response;

    const clientKey = getClientKey(request);
    const limitType = getRateLimitType(pathname);
    const maxRequests = CONFIG.MAX_REQUESTS[limitType];
    const record = rateLimitStore.get(`${limitType}:${clientKey}`);

    if (record) {
        response.headers.set('X-RateLimit-Limit', String(maxRequests));
        response.headers.set('X-RateLimit-Remaining', String(Math.max(0, maxRequests - record.count)));
        response.headers.set('X-RateLimit-Reset', String(Math.ceil(record.resetTime / 1000)));
    }

    return response;
}
