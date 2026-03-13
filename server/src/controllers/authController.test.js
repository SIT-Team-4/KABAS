import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../services/authService.js', () => ({
    register: vi.fn(),
    login: vi.fn(),
}));

const authService = await import('../services/authService.js');
const { register, login, me } = await import('./authController.js');

beforeEach(() => {
    vi.clearAllMocks();
});

function mockRes() {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
}

describe('authController', () => {
    const mockUser = { id: 1, name: 'Test', email: 'test@example.com', role: 'instructor' };

    describe('register', () => {
        it('should return 201 with user data on success', async () => {
            authService.register.mockResolvedValue(mockUser);
            const req = { body: { name: 'Test', email: 'test@example.com', password: 'password123' } };
            const res = mockRes();
            const next = vi.fn();

            await register(req, res, next);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: mockUser });
        });

        it('should return 400 on validation error', async () => {
            const req = { body: { name: '', email: 'bad', password: 'short' } };
            const res = mockRes();
            const next = vi.fn();

            await register(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: false }),
            );
        });

        it('should call next on service error', async () => {
            const error = new Error('DB error');
            authService.register.mockRejectedValue(error);
            const req = { body: { name: 'Test', email: 'test@example.com', password: 'password123' } };
            const res = mockRes();
            const next = vi.fn();

            await register(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('login', () => {
        it('should return 200 with token on success', async () => {
            const loginResult = { token: 'jwt-token', user: mockUser };
            authService.login.mockResolvedValue(loginResult);
            const req = { body: { email: 'test@example.com', password: 'password123' } };
            const res = mockRes();
            const next = vi.fn();

            await login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: loginResult });
        });

        it('should return 400 on validation error', async () => {
            const req = { body: { email: '', password: '' } };
            const res = mockRes();
            const next = vi.fn();

            await login(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: false }),
            );
        });

        it('should call next on service error', async () => {
            const error = new Error('Invalid credentials');
            error.status = 401;
            authService.login.mockRejectedValue(error);
            const req = { body: { email: 'test@example.com', password: 'wrong' } };
            const res = mockRes();
            const next = vi.fn();

            await login(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
        });
    });

    describe('me', () => {
        it('should return the current user', async () => {
            const req = { user: mockUser };
            const res = mockRes();

            await me(req, res);

            expect(res.json).toHaveBeenCalledWith({ success: true, data: mockUser });
        });
    });
});
