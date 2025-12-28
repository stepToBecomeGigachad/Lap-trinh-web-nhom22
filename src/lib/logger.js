import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Server-side Logger
 * Logs to console and files for security auditing
 */

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    SECURITY: 4,
};

const LOG_COLORS = {
    DEBUG: '\x1b[36m',    // Cyan
    INFO: '\x1b[32m',     // Green
    WARN: '\x1b[33m',     // Yellow
    ERROR: '\x1b[31m',    // Red
    SECURITY: '\x1b[35m', // Magenta
    RESET: '\x1b[0m',
};

// Get log level from environment
const currentLevel = LOG_LEVELS[process.env.LOG_LEVEL?.toUpperCase()] ?? LOG_LEVELS.INFO;

/**
 * Get current timestamp in ISO format
 */
function getTimestamp() {
    return new Date().toISOString();
}

/**
 * Format log message
 */
function formatMessage(level, message, meta = {}) {
    const timestamp = getTimestamp();
    const metaStr = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaStr}`;
}

/**
 * Write log to file (async-safe)
 */
function writeToFile(filename, message) {
    try {
        const logsDir = join(process.cwd(), 'logs');
        if (!existsSync(logsDir)) {
            mkdirSync(logsDir, { recursive: true });
        }

        const date = new Date().toISOString().split('T')[0];
        const filepath = join(logsDir, `${filename}-${date}.log`);
        appendFileSync(filepath, message + '\n');
    } catch {
        // Silently fail if can't write to file
    }
}

/**
 * Log to console with colors
 */
function logToConsole(level, message) {
    const color = LOG_COLORS[level] || LOG_COLORS.RESET;
    console.log(`${color}${message}${LOG_COLORS.RESET}`);
}

/**
 * Main log function
 */
function log(level, message, meta = {}) {
    if (LOG_LEVELS[level] < currentLevel) return;

    const formattedMessage = formatMessage(level, message, meta);

    // Console output
    logToConsole(level, formattedMessage);

    // File output
    writeToFile('app', formattedMessage);

    // Security events go to separate file
    if (level === 'SECURITY') {
        writeToFile('security', formattedMessage);
    }

    // Errors go to error file
    if (level === 'ERROR') {
        writeToFile('error', formattedMessage);
    }
}

// Export log functions
export const logger = {
    debug: (msg, meta) => log('DEBUG', msg, meta),
    info: (msg, meta) => log('INFO', msg, meta),
    warn: (msg, meta) => log('WARN', msg, meta),
    error: (msg, meta) => log('ERROR', msg, meta),
    security: (msg, meta) => log('SECURITY', msg, meta),
};

/**
 * Log security event with request details
 */
export function logSecurityEvent(request, event, details = {}) {
    const forwarded = request.headers?.get?.('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const userAgent = request.headers?.get?.('user-agent') || 'unknown';
    const { pathname } = request.nextUrl || {};

    logger.security(event, {
        ip,
        path: pathname,
        userAgent: userAgent.substring(0, 100),
        ...details,
    });
}

/**
 * Log API request
 */
export function logApiRequest(request, response, duration) {
    const { pathname } = request.nextUrl || {};
    const method = request.method;
    const status = response?.status;

    const level = status >= 500 ? 'ERROR' : status >= 400 ? 'WARN' : 'INFO';

    logger[level.toLowerCase()](`${method} ${pathname} ${status} ${duration}ms`);
}

export default logger;
