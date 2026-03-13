import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/authService.js', () => ({
    verifyToken: vi.fn(),
}));

const { verifyToken } = await import('../services/authService.js');
const { default: auth } = await import('./auth.js');

function mockRes() {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
}

beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.ADMIN_API_KEY;
});

describe('auth middleware', () => {
    describe('JWT Bearer token', () => {
        it('should authenticate with valid JWT and set req.user', async () => {
            const mockUser = { id: 1, name: 'Test', email: 'test@example.com', role: 'instructor' };
            verifyToken.mockResolvedValue(mockUser);

            const req = { headers: { authorization: 'Bearer valid-token' } };
            const res = mockRes();
            const next = vi.fn();

            await auth(req, res, next);

            expect(verifyToken).toHaveBeenCalledWith('valid-token');
            expect(req.user).toEqual(mockUser);
            expect(next).toHaveBeenCalled();
        });

        it('should return 401 for invalid JWT', async () => {
            verifyToken.mockRejectedValue(new Error('jwt malformed'));

            const req = { headers: { authorization: 'Bearer bad-token' } };
            const res = mockRes();
            const next = vi.fn();

            await auth(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Invalid or expired token' });
            expect(next).not.toHaveBeenCalled();
        });
    });

    describe('API key auth', () => {
        it('should authenticate with valid API key', async () => {
            process.env.ADMIN_API_KEY = 'test-api-key';

            const req = { headers: { 'x-api-key': 'test-api-key' } };
            const res = mockRes();
            const next = vi.fn();

            await auth(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        it('should return 401 for invalid API key', async () => {
            process.env.ADMIN_API_KEY = 'test-api-key';

            const req = { headers: { 'x-api-key': 'wrong-key-here' } };
            const res = mockRes();
            const next = vi.fn();

            await auth(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Unauthorized' });
        });

        it('should return 401 when no API key is provided', async () => {
            process.env.ADMIN_API_KEY = 'test-api-key';

            const req = { headers: {} };
            const res = mockRes();
            const next = vi.fn();

            await auth(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Unauthorized' });
        });

        it('should return 401 when ADMIN_API_KEY is not configured', async () => {
            const req = { headers: { 'x-api-key': 'some-key' } };
            const res = mockRes();
            const next = vi.fn();

            await auth(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ success: false, error: 'Unauthorized' });
        });
    });

    describe('no auth provided', () => {
        it('should return 401 when no auth header and no API key', async () => {
            const req = { headers: {} };
            const res = mockRes();
            const next = vi.fn();

            await auth(req, res, next);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(next).not.toHaveBeenCalled();
        });
    });
});
