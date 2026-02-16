import * as githubService from '../services/githubService.js';

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
