import * as analyticsService from '../services/analyticsService.js';

/**
 * Get analytics data for a team.
 * @param {import('express').Request} req - Express request with teamId param.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next middleware.
 */
// eslint-disable-next-line import/prefer-default-export
export async function getTeamAnalytics(req, res, next) {
    try {
        const { teamId } = req.params;
        const data = await analyticsService.getTeamAnalytics(teamId);
        res.json({ success: true, data });
    } catch (err) {
        next(err);
    }
}
