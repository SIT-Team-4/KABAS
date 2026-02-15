import {
    describe, it, expect, vi,
} from 'vitest';
import express from 'express';
import request from 'supertest';

vi.mock('../services/githubService.js', () => ({
    getKanbanData: vi.fn(),
}));

const { getKanbanData: mockGetKanbanData } = await import('../services/githubService.js');

// Import router after mocking the service
const { default: githubRoutes } = await import('./github.js');

const app = express();
app.use('/', githubRoutes);
app.use((err, req, res, _next) => {
    res.status(err.status || 500).json({ error: err.message });
});

describe('GET /:owner/:repo/kanban', () => {
    it.each([
        {
            name: 'returns kanban data with valid token',
            token: 'ghp_test',
            mockResult: {
                repository: { owner: 'org', repo: 'repo' },
                fetchedAt: '2026-01-01T00:00:00.000Z',
                issues: [],
            },
            expectedStatus: 200,
            expectedBody: {
                repository: { owner: 'org', repo: 'repo' },
                fetchedAt: '2026-01-01T00:00:00.000Z',
                issues: [],
            },
        },
        {
            name: 'returns 401 without X-GitHub-Token header',
            token: null,
            mockResult: null,
            expectedStatus: 401,
            expectedBody: { error: 'GitHub token is required' },
        },
    ])('$name', async ({
        token, mockResult, expectedStatus, expectedBody,
    }) => {
        if (mockResult) {
            mockGetKanbanData.mockResolvedValue(mockResult);
        }

        const req = request(app).get('/org/repo/kanban');
        if (token) {
            req.set('X-GitHub-Token', token);
        }

        const res = await req;

        expect(res.status).toBe(expectedStatus);
        expect(res.body).toEqual(expectedBody);
    });
});
