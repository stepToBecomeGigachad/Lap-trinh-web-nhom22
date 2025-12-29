import { NextResponse } from 'next/server';

/**
 * Security Headers Configuration
 */
const SECURITY_HEADERS = {
    // Prevent clickjacking
    'X-Frame-Options': 'SAMEORIGIN',

    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // XSS Protection (legacy, but still useful)
    'X-XSS-Protection': '1; mode=block',

    // Referrer Policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions Policy (restrict browser features)
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

/**
 * Add security headers to response
 */
export function addSecurityHeaders(response) {
    for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
        response.headers.set(header, value);
    }
    return response;
}

/**
 * CSRF Protection middleware
 * Checks Origin header for state-changing requests
 */
export function checkCsrf(request) {
    const { pathname } = request.nextUrl;
    const method = request.method;

    // Only check state-changing methods on API routes
    if (!pathname.startsWith('/api/')) return null;
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return null;

    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    const normalizeOrigin = (value) => value
        .trim()
        .replace(/^['"]|['"]$/g, '')
        .replace(/\/$/, '');
    const trustedOrigins = (process.env.CSRF_TRUSTED_ORIGINS || '')
        .split(',')
        .map(normalizeOrigin)
        .filter(Boolean);

    // If no origin header, allow (same-origin requests may not have it)
    if (!origin) return null;

    try {
        const normalizedOrigin = normalizeOrigin(origin);
        const originHost = new URL(normalizedOrigin).host;

        const isTrustedOrigin =
            originHost === host ||
            trustedOrigins.includes(normalizedOrigin) ||
            trustedOrigins.includes(originHost);

        // Block if origin doesn't match host and isn't in allowlist
        if (!isTrustedOrigin) {
            console.warn(`CSRF blocked: origin=${origin}, host=${host}`);
            return NextResponse.json(
                { ok: false, error: 'Yêu cầu không hợp lệ' },
                { status: 403 }
            );
        }
    } catch {
        // Invalid origin URL
        return NextResponse.json(
            { ok: false, error: 'Origin không hợp lệ' },
            { status: 403 }
        );
    }

    return null;
}

/**
 * Sanitize common XSS patterns from string
 */
export function sanitizeString(str) {
    if (typeof str !== 'string') return str;

    return str
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Check for SQL injection patterns (basic detection)
 */
export function hasSqlInjection(str) {
    if (typeof str !== 'string') return false;

    const suspiciousChars = /(--|#|\/\*|;|['"`=])/;
    if (!suspiciousChars.test(str)) return false;

    const sqlPatterns = [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
        /(\bOR\b\s+['"\d].*=\s*['"\d])/i,
        /(\bAND\b\s+['"\d].*=\s*['"\d])/i,
        /(;\s*(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
        /(--|#|\/\*)/,
    ];

    return sqlPatterns.some(pattern => pattern.test(str));
}

/**
 * Validate and sanitize request body
 * Returns null if valid, error response if invalid
 */
export async function validateRequestBody(request) {
    const method = request.method;
    const { pathname } = request.nextUrl;

    if (!pathname.startsWith('/api/')) return null;
    if (!['POST', 'PUT', 'PATCH'].includes(method)) return null;

    // Clone request to read body
    try {
        const clonedRequest = request.clone();
        const contentType = request.headers.get('content-type') || '';

        if (contentType.includes('application/json')) {
            const body = await clonedRequest.json();

            // Check all string values for SQL injection
            const checkObject = (obj) => {
                for (const [key, value] of Object.entries(obj)) {
                    if (typeof value === 'string' && hasSqlInjection(value)) {
                        console.warn(`SQL injection detected in ${pathname}, field: ${key}`);
                        return true;
                    }
                    if (value && typeof value === 'object') {
                        if (checkObject(value)) return true;
                    }
                }
                return false;
            };

            if (checkObject(body)) {
                return NextResponse.json(
                    { ok: false, error: 'Dữ liệu không hợp lệ' },
                    { status: 400 }
                );
            }
        }
    } catch {
        // Failed to parse body - let the API handle it
    }

    return null;
}
