import {
    createTeamCredentialSchema,
    updateTeamCredentialSchema,
} from '../validation/teamCredentialSchema.js';
import * as teamCredentialService from '../services/teamCredentialService.js';

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

export async function remove(req, res, next) {
    try {
        await teamCredentialService.deleteCredential(req.params.teamId);
        res.json({ success: true, message: 'Credential deleted' });
    } catch (err) {
        next(err);
    }
}
