import * as analyticsService from '../services/analyticsService.js';

/**
 * Get analytics data for a team.
 * @param {import('express').Request} req - Express request with teamId param.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next middleware.
 */
export async function getTeamAnalytics(req, res, next) {
    try {
        const { teamId } = req.params;
        const data = await analyticsService.getTeamAnalytics(teamId);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
}

/**
 * Get analytics data for all teams, optionally filtered by class group.
 * @param {import('express').Request} req - Express request with optional classGroupId query param.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next middleware.
 */
export async function getAllTeamsAnalytics(req, res, next) {
    try {
        const { classGroupId } = req.query;
        const data = await analyticsService.getAllTeamsAnalytics({
            classGroupId: classGroupId ? Number(classGroupId) : undefined,
        });
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
}
