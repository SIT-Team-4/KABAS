import crypto from 'crypto';
import * as authService from '../services/authService.js';

/**
 * Dual auth middleware: supports JWT Bearer token and API key (x-api-key header).
 * JWT is checked first; if no Bearer token is present, falls back to API key.
 */
const auth = async (req, res, next) => {
    // Check for JWT Bearer token first
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.slice(7);
        try {
            req.user = await authService.verifyToken(token);
            return next();
        } catch {
            return res.status(401).json({ success: false, error: 'Invalid or expired token' });
        }
    }

    // Fall back to API key auth
    const apiKey = req.headers['x-api-key'];
    const adminKey = process.env.ADMIN_API_KEY;

    if (!apiKey || !adminKey) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const keyBuffer = Buffer.from(apiKey);
    const adminBuffer = Buffer.from(adminKey);

    if (keyBuffer.length !== adminBuffer.length
        || !crypto.timingSafeEqual(keyBuffer, adminBuffer)) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    return next();
};

export default auth;
