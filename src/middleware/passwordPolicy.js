/**
 * Password Policy Configuration
 */
const PASSWORD_POLICY = {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBER: true,
    REQUIRE_SPECIAL: false, // Optional: require special characters
    SPECIAL_CHARS: '!@#$%^&*()_+-=[]{}|;:,.<>?',

    // Common weak passwords to reject
    BLACKLIST: [
        'password', 'password123', '123456', '12345678', 'qwerty',
        'abc123', 'admin', 'letmein', 'welcome', 'monkey',
        '1234567890', 'password1', 'admin123', 'root', 'toor',
    ],
};

/**
 * Validate password against policy
 * Returns { valid: boolean, errors: string[] }
 */
export function validatePassword(password) {
    const errors = [];

    if (!password || typeof password !== 'string') {
        return { valid: false, errors: ['Mật khẩu không được để trống'] };
    }

    // Length check
    if (password.length < PASSWORD_POLICY.MIN_LENGTH) {
        errors.push(`Mật khẩu phải có ít nhất ${PASSWORD_POLICY.MIN_LENGTH} ký tự`);
    }

    if (password.length > PASSWORD_POLICY.MAX_LENGTH) {
        errors.push(`Mật khẩu không được quá ${PASSWORD_POLICY.MAX_LENGTH} ký tự`);
    }

    // Uppercase check
    if (PASSWORD_POLICY.REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
        errors.push('Mật khẩu phải có ít nhất 1 chữ hoa');
    }

    // Lowercase check
    if (PASSWORD_POLICY.REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
        errors.push('Mật khẩu phải có ít nhất 1 chữ thường');
    }

    // Number check
    if (PASSWORD_POLICY.REQUIRE_NUMBER && !/[0-9]/.test(password)) {
        errors.push('Mật khẩu phải có ít nhất 1 số');
    }

    // Special character check
    if (PASSWORD_POLICY.REQUIRE_SPECIAL) {
        const specialRegex = new RegExp(`[${PASSWORD_POLICY.SPECIAL_CHARS.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')}]`);
        if (!specialRegex.test(password)) {
            errors.push('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
        }
    }

    // Blacklist check
    if (PASSWORD_POLICY.BLACKLIST.includes(password.toLowerCase())) {
        errors.push('Mật khẩu quá phổ biến, vui lòng chọn mật khẩu khác');
    }

    // Check for sequential characters
    if (hasSequentialChars(password, 4)) {
        errors.push('Mật khẩu không nên có các ký tự liên tiếp (như 1234, abcd)');
    }

    // Check for repeated characters
    if (hasRepeatedChars(password, 4)) {
        errors.push('Mật khẩu không nên có ký tự lặp lại quá nhiều (như aaaa)');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

/**
 * Check for sequential characters (1234, abcd, etc.)
 */
function hasSequentialChars(str, minLength) {
    for (let i = 0; i <= str.length - minLength; i++) {
        let isSequential = true;
        for (let j = 1; j < minLength; j++) {
            if (str.charCodeAt(i + j) !== str.charCodeAt(i + j - 1) + 1) {
                isSequential = false;
                break;
            }
        }
        if (isSequential) return true;
    }
    return false;
}

/**
 * Check for repeated characters (aaaa, 1111, etc.)
 */
function hasRepeatedChars(str, minLength) {
    for (let i = 0; i <= str.length - minLength; i++) {
        let isRepeated = true;
        for (let j = 1; j < minLength; j++) {
            if (str[i + j] !== str[i]) {
                isRepeated = false;
                break;
            }
        }
        if (isRepeated) return true;
    }
    return false;
}

/**
 * Calculate password strength (0-100)
 */
export function getPasswordStrength(password) {
    if (!password) return 0;

    let score = 0;

    // Length score (up to 30 points)
    score += Math.min(30, password.length * 2);

    // Character diversity (up to 40 points)
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^a-zA-Z0-9]/.test(password)) score += 10;

    // Bonus for mixing (up to 30 points)
    const types = [
        /[a-z]/.test(password),
        /[A-Z]/.test(password),
        /[0-9]/.test(password),
        /[^a-zA-Z0-9]/.test(password),
    ].filter(Boolean).length;
    score += types * 7.5;

    // Penalties
    if (PASSWORD_POLICY.BLACKLIST.includes(password.toLowerCase())) score = Math.min(score, 10);
    if (hasSequentialChars(password, 4)) score -= 20;
    if (hasRepeatedChars(password, 4)) score -= 20;

    return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Get strength label
 */
export function getStrengthLabel(score) {
    if (score < 20) return { label: 'Rất yếu', color: 'red' };
    if (score < 40) return { label: 'Yếu', color: 'orange' };
    if (score < 60) return { label: 'Trung bình', color: 'yellow' };
    if (score < 80) return { label: 'Mạnh', color: 'lightgreen' };
    return { label: 'Rất mạnh', color: 'green' };
}

/**
 * Validate email format
 */
export function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return { valid: false, error: 'Email không được để trống' };
    }

    // Basic email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        return { valid: false, error: 'Email không hợp lệ' };
    }

    if (email.length > 254) {
        return { valid: false, error: 'Email quá dài' };
    }

    return { valid: true, error: null };
}

/**
 * Validate phone number (Vietnam format)
 */
export function validatePhone(phone) {
    if (!phone) return { valid: true, error: null }; // Optional field

    // Remove spaces and dashes
    const cleaned = phone.replace(/[\s-]/g, '');

    // Vietnam phone patterns
    const phoneRegex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;

    if (!phoneRegex.test(cleaned)) {
        return { valid: false, error: 'Số điện thoại không hợp lệ' };
    }

    return { valid: true, error: null };
}
