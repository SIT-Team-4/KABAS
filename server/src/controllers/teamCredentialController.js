import {
    createTeamCredentialSchema,
    updateTeamCredentialSchema,
} from '../validation/teamCredentialSchema.js';
import * as teamCredentialService from '../services/teamCredentialService.js';

/**
 * Create a credential for a team.
 * @param {import('express').Request} req - Request with teamId param and body.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next middleware.
 */
export async function create(req, res, next) {
    try {
        const data = await createTeamCredentialSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        const credential = await teamCredentialService.createCredential(
            req.params.teamId,
            data,
        );
        return res.status(201).json({ success: true, data: credential });
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
 * Get the credential for a team (sanitized, without the raw API token).
 * @param {import('express').Request} req - Express request with teamId param.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next middleware.
 */
export async function get(req, res, next) {
    try {
        const credential = await teamCredentialService.getCredential(
            req.params.teamId,
        );
        res.json({ success: true, data: credential });
    } catch (err) {
        next(err);
    }
}

/**
 * Update the credential for a team.
 * @param {import('express').Request} req - Request with teamId param and body.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next middleware.
 */
export async function update(req, res, next) {
    try {
        const data = await updateTeamCredentialSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        const credential = await teamCredentialService.updateCredential(
            req.params.teamId,
            data,
        );
        return res.json({ success: true, data: credential });
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
 * Delete the credential for a team.
 * @param {import('express').Request} req - Express request with teamId param.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next middleware.
 */
export async function remove(req, res, next) {
    try {
        await teamCredentialService.deleteCredential(req.params.teamId);
        res.json({ success: true, message: 'Credential deleted' });
    } catch (err) {
        next(err);
    }
}
