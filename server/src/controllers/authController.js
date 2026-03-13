import { registerSchema, loginSchema } from '../validation/authSchema.js';
import * as authService from '../services/authService.js';

/**
 * Register a new user.
 * @param {import('express').Request} req - Express request with user data in body.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next middleware.
 */
export async function register(req, res, next) {
    try {
        const data = await registerSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        const user = await authService.register(data);
        return res.status(201).json({ success: true, data: user });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res
                .status(400)
                .json({ success: false, error: err.errors.join(', ') });
        }
        return next(err);
    }
}

/**
 * Log in a user.
 * @param {import('express').Request} req - Express request with login credentials in body.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next middleware.
 */
export async function login(req, res, next) {
    try {
        const data = await loginSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        const result = await authService.login(data);
        return res.status(200).json({ success: true, data: result });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res
                .status(400)
                .json({ success: false, error: err.errors.join(', ') });
        }
        return next(err);
    }
}

/**
 * Get the currently authenticated user.
 * @param {import('express').Request} req - Express request with user set by auth middleware.
 * @param {import('express').Response} res - Express response.
 */
export async function me(req, res) {
    return res.json({ success: true, data: req.user });
}
