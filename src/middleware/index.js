/**
 * Middleware exports
 * Import all middleware functions from this central location
 */

// Authentication & Authorization
export {
    getSession,
    isAuthenticated,
    isAdmin,
    checkAdminAccess,
    checkAdminApiAccess,
    checkUserAccess,
    checkUserApiAccess,
} from './auth';

// Rate Limiting
export {
    checkRateLimit,
    addRateLimitHeaders,
} from './rateLimit';

// Security
export {
    addSecurityHeaders,
    checkCsrf,
    sanitizeString,
    hasSqlInjection,
    validateRequestBody,
} from './security';

// Password Policy & Validation
export {
    validatePassword,
    getPasswordStrength,
    getStrengthLabel,
    validateEmail,
    validatePhone,
} from './passwordPolicy';

// Order Validation
export {
    validateQuantity,
    validatePrice,
    validateOrderItems,
    checkStockAvailability,
    sanitizeShippingInfo,
    sanitizeNote,
    calculateServerTotal,
    validateCoupon,
} from './orderValidation';

// IDOR Prevention
export {
    canAccessOrder,
    canModifyOrder,
    canAccessUser,
    canAccessReview,
    verifyOwnership,
    sanitizeOrderResponse,
} from './idor';
