import {
    createTeamSchema,
    updateTeamSchema,
} from '../validation/teamSchema.js';
import * as teamService from '../services/teamService.js';

export async function create(req, res, next) {
    try {
        const data = await createTeamSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        const team = await teamService.createTeam(data);
        res.status(201).json({ success: true, data: team });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res
                .status(400)
                .json({ success: false, error: err.errors.join(', ') });
        }
        next(err);
    }
}

export async function getAll(req, res, next) {
    try {
        const teams = await teamService.getAllTeams(req.query);
        res.json({ success: true, data: teams });
    } catch (err) {
        next(err);
    }
}

export async function getById(req, res, next) {
    try {
        const team = await teamService.getTeamById(req.params.teamId);
        res.json({ success: true, data: team });
    } catch (err) {
        next(err);
    }
}

export async function update(req, res, next) {
    try {
        const data = await updateTeamSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        const team = await teamService.updateTeam(req.params.teamId, data);
        res.json({ success: true, data: team });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res
                .status(400)
                .json({ success: false, error: err.errors.join(', ') });
        }
        next(err);
    }
}

export async function remove(req, res, next) {
    try {
        await teamService.deleteTeam(req.params.teamId);
        res.json({ success: true, message: 'Team deleted' });
    } catch (err) {
        next(err);
    }
}
