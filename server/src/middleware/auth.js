import 'dotenv/config';

/**
 * Simple API key auth middleware.
 * Checks `x-api-key` header against `process.env.ADMIN_API_KEY`.
 */
export default function auth(req, res, next) {
    const expected = process.env.ADMIN_API_KEY || '';
    if (!expected) {
        // If no admin key configured, deny by default in production; allow in tests
        if (process.env.NODE_ENV === 'test') {
            return next();
        }
        return res.status(401).json({ success: false, error: 'Admin API key not configured' });
    }

    const got = req.headers['x-api-key'] || req.headers['X-API-KEY'] || '';
    if (String(got) === expected) {
        return next();
    }

    return res.status(401).json({ success: false, error: 'Unauthorized' });
}
