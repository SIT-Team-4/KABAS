import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../models/index.js', () => ({
    User: {
        findOne: vi.fn(),
        findByPk: vi.fn(),
        create: vi.fn(),
    },
}));
vi.mock('bcryptjs', () => ({ default: { compare: vi.fn() } }));
vi.mock('jsonwebtoken', () => ({ default: { sign: vi.fn(), verify: vi.fn() } }));

const { User } = await import('../models/index.js');
const bcrypt = (await import('bcryptjs')).default;
const jwt = (await import('jsonwebtoken')).default;
const { register, login, verifyToken } = await import('./authService.js');

beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret';
});

describe('authService', () => {
    const mockSafeUser = { id: 1, name: 'Test', email: 'test@example.com', role: 'instructor' };
    const mockUser = {
        id: 1,
        name: 'Test',
        email: 'test@example.com',
        password: 'hashed',
        role: 'instructor',
        toSafeJSON: vi.fn(() => mockSafeUser),
    };

    describe('register', () => {
        it('should create a new user and return safe JSON', async () => {
            User.findOne.mockResolvedValue(null);
            User.create.mockResolvedValue(mockUser);

            const result = await register({ name: 'Test', email: 'test@example.com', password: 'password123' });

            expect(User.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
            expect(User.create).toHaveBeenCalled();
            expect(result).toEqual(mockSafeUser);
        });

        it('should throw 409 if email already exists', async () => {
            User.findOne.mockResolvedValue(mockUser);

            await expect(register({ name: 'Test', email: 'test@example.com', password: 'password123' }))
                .rejects.toThrow('Email already registered');

            try {
                await register({ name: 'Test', email: 'test@example.com', password: 'password123' });
            } catch (err) {
                expect(err.status).toBe(409);
            }
        });
    });

    describe('login', () => {
        it('should return token and user on valid credentials', async () => {
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            jwt.sign.mockReturnValue('mock-token');

            const result = await login({ email: 'test@example.com', password: 'password123' });

            expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashed');
            expect(jwt.sign).toHaveBeenCalledWith(
                { id: 1, email: 'test@example.com', role: 'instructor' },
                'test-secret',
                { expiresIn: '24h' },
            );
            expect(result).toEqual({ token: 'mock-token', user: mockSafeUser });
        });

        it('should throw 401 if user not found', async () => {
            User.findOne.mockResolvedValue(null);

            try {
                await login({ email: 'wrong@example.com', password: 'password123' });
            } catch (err) {
                expect(err.message).toBe('Invalid credentials');
                expect(err.status).toBe(401);
            }
        });

        it('should throw 401 if password is wrong', async () => {
            User.findOne.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);

            try {
                await login({ email: 'test@example.com', password: 'wrong' });
            } catch (err) {
                expect(err.message).toBe('Invalid credentials');
                expect(err.status).toBe(401);
            }
        });
    });

    describe('verifyToken', () => {
        it('should return user for a valid token', async () => {
            jwt.verify.mockReturnValue({ id: 1 });
            User.findByPk.mockResolvedValue(mockUser);

            const result = await verifyToken('valid-token');

            expect(jwt.verify).toHaveBeenCalledWith('valid-token', 'test-secret');
            expect(User.findByPk).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockSafeUser);
        });

        it('should throw if token is invalid', async () => {
            jwt.verify.mockImplementation(() => {
                throw new Error('jwt malformed');
            });

            await expect(verifyToken('bad-token')).rejects.toThrow('jwt malformed');
        });

        it('should throw 401 if user not found', async () => {
            jwt.verify.mockReturnValue({ id: 999 });
            User.findByPk.mockResolvedValue(null);

            try {
                await verifyToken('valid-token');
            } catch (err) {
                expect(err.message).toBe('User not found');
                expect(err.status).toBe(401);
            }
        });
    });
});
