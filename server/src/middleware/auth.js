import crypto from 'crypto';

/**
 * Simple API key auth middleware.
 * Checks `x-api-key` header against `process.env.ADMIN_API_KEY` using timing-safe comparison.
 */
export default function auth(req, res, next) {
    const expected = process.env.ADMIN_API_KEY || '';
    if (!expected) {
        return res.status(401).json({ success: false, error: 'Admin API key not configured' });
    }

    const got = req.headers['x-api-key'] || '';

    // Use timing-safe comparison to prevent timing attacks
    try {
        const expectedBuf = Buffer.from(expected);
        const gotBuf = Buffer.from(got);

        // If lengths differ, compare against a dummy buffer of same length to consume same time
        if (expectedBuf.length !== gotBuf.length) {
            crypto.timingSafeEqual(expectedBuf, Buffer.alloc(expectedBuf.length));
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        if (crypto.timingSafeEqual(expectedBuf, gotBuf)) {
            return next();
        }
    } catch (err) {
        // timingSafeEqual throws on length mismatch in older Node versions; return 401
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    return res.status(401).json({ success: false, error: 'Unauthorized' });
}
