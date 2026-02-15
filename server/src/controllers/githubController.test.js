import {
    describe, it, expect, vi,
} from 'vitest';
import { getKanbanData } from './githubController.js';

vi.mock('../services/githubService.js', () => ({
    getKanbanData: vi.fn(),
}));

const { getKanbanData: mockGetKanbanData } = await import('../services/githubService.js');

function buildReq({ headers = {}, params = {} } = {}) {
    return { headers, params };
}

function buildRes() {
    const res = {};
    res.json = vi.fn().mockReturnValue(res);
    return res;
}

describe('githubController.getKanbanData', () => {
    it.each([
        {
            name: 'returns 401 when X-GitHub-Token header is missing',
            headers: {},
            params: { owner: 'org', repo: 'repo' },
            serviceResult: null,
            expectNext: {
                message: 'GitHub token is required',
                status: 401,
            },
            expectJson: false,
        },
        {
            name: 'returns kanban data on success',
            headers: { 'x-github-token': 'ghp_test' },
            params: { owner: 'org', repo: 'repo' },
            serviceResult: {
                repository: { owner: 'org', repo: 'repo' },
                fetchedAt: '2026-01-01T00:00:00.000Z',
                issues: [],
            },
            expectNext: null,
            expectJson: true,
        },
    ])('$name', async ({
        headers, params, serviceResult, expectNext, expectJson,
    }) => {
        if (serviceResult) {
            mockGetKanbanData.mockResolvedValue(serviceResult);
        }

        const req = buildReq({ headers, params });
        const res = buildRes();
        const next = vi.fn();

        await getKanbanData(req, res, next);

        if (expectNext) {
            expect(next).toHaveBeenCalledWith(
                expect.objectContaining(expectNext),
            );
            expect(res.json).not.toHaveBeenCalled();
        }
        if (expectJson) {
            expect(res.json).toHaveBeenCalledWith(serviceResult);
            expect(next).not.toHaveBeenCalled();
        }
    });

    it('passes service errors to next()', async () => {
        const error = new Error('Repository not found');
        error.status = 404;
        mockGetKanbanData.mockRejectedValue(error);

        const req = buildReq({
            headers: { 'x-github-token': 'ghp_test' },
            params: { owner: 'org', repo: 'repo' },
        });
        const res = buildRes();
        const next = vi.fn();

        await getKanbanData(req, res, next);

        expect(next).toHaveBeenCalledWith(error);
        expect(res.json).not.toHaveBeenCalled();
    });
});
