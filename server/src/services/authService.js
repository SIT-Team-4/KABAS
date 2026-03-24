import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

/**
 * Register a new user.
 * @param {Object} data - User data (name, email, password).
 * @returns {Promise<Object>} The created user (without password).
 * @throws {Error} 409 if the email is already registered.
 */
export async function register(data) {
    const existing = await User.findOne({ where: { email: data.email } });
    if (existing) {
        const error = new Error('Email already registered');
        error.status = 409;
        throw error;
    }
    const user = await User.create(data);
    return user.toSafeJSON();
}

/**
 * Authenticate a user and return a JWT token.
 * @param {Object} data - Login credentials (email, password).
 * @returns {Promise<Object>} Object with token and user (without password).
 * @throws {Error} 401 if credentials are invalid.
 */
export async function login(data) {
    const user = await User.findOne({ where: { email: data.email } });
    if (!user) {
        const error = new Error('Invalid credentials');
        error.status = 401;
        throw error;
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
        const error = new Error('Invalid credentials');
        error.status = 401;
        throw error;
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRY || '24h' },
    );

    return { token, user: user.toSafeJSON() };
}

/**
 * Verify a JWT token and return the associated user.
 * @param {string} token - The JWT token to verify.
 * @returns {Promise<Object>} The user (without password).
 * @throws {Error} 401 if the token is invalid or the user is not found.
 */
export async function verifyToken(token) {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
        const error = new Error('User not found');
        error.status = 401;
        throw error;
    }
    return user.toSafeJSON();
}
