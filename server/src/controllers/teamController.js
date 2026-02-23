import {
    createTeamSchema,
    updateTeamSchema,
} from '../validation/teamSchema.js';
import * as teamService from '../services/teamService.js';

/**
 * Create a new team.
 * @param {import('express').Request} req - Express request with team data in body.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next middleware.
 */
export async function create(req, res, next) {
    try {
        const data = await createTeamSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        const team = await teamService.createTeam(data);
        return res.status(201).json({ success: true, data: team });
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
 * Get all teams, optionally filtered by query parameters.
 * @param {import('express').Request} req - Express request with optional classGroupId query.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next middleware.
 */
export async function getAll(req, res, next) {
    try {
        const teams = await teamService.getAllTeams(req.query);
        res.json({ success: true, data: teams });
    } catch (err) {
        next(err);
    }
}

/**
 * Get a single team by ID.
 * @param {import('express').Request} req - Express request with teamId param.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next middleware.
 */
export async function getById(req, res, next) {
    try {
        const team = await teamService.getTeamById(req.params.teamId);
        res.json({ success: true, data: team });
    } catch (err) {
        next(err);
    }
}

/**
 * Update an existing team.
 * @param {import('express').Request} req - Request with teamId param and body.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next middleware.
 */
export async function update(req, res, next) {
    try {
        const data = await updateTeamSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        const team = await teamService.updateTeam(req.params.teamId, data);
        return res.json({ success: true, data: team });
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
 * Delete a team by ID.
 * @param {import('express').Request} req - Express request with teamId param.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next middleware.
 */
export async function remove(req, res, next) {
    try {
        await teamService.deleteTeam(req.params.teamId);
        res.json({ success: true, message: 'Team deleted' });
    } catch (err) {
        next(err);
    }
}
