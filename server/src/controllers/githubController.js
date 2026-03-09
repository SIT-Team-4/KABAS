import * as githubService from '../services/githubService.js';

/**
 * Fetch Kanban board data for a GitHub repository.
 * Requires `x-github-token` header for authentication.
 * @param {import('express').Request} req - Express request with owner/repo params.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next middleware.
 */
// eslint-disable-next-line import/prefer-default-export
export async function getKanbanData(req, res, next) {
    const token = req.headers['x-github-token'];

    if (!token) {
        const err = new Error('GitHub token is required');
        err.status = 401;
        return next(err);
    }

    const { owner, repo } = req.params;

    try {
        const data = await githubService.getKanbanData(token, owner, repo);
        return res.json(data);
    } catch (err) {
        return next(err);
    }
}
