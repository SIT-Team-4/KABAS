import {
    describe, it, expect, vi, beforeEach,
} from 'vitest';
import { fetchIssues, fetchIssueTimeline, fetchProjectBoardStatuses } from './githubGateway.js';

const owner = 'test-org';
const repo = 'test-repo';

function makeOctokit({ paginate = vi.fn(), graphql = vi.fn() } = {}) {
    return { paginate, graphql };
}

describe('githubGateway', () => {
    describe('fetchIssues', () => {
        it('calls paginate with correct endpoint and parameters', async () => {
            const paginate = vi.fn().mockResolvedValue([]);
            const octokit = makeOctokit({ paginate });

            await fetchIssues(octokit, owner, repo);

            expect(paginate).toHaveBeenCalledWith(
                'GET /repos/{owner}/{repo}/issues',
                {
                    owner,
                    repo,
                    state: 'all',
                    per_page: 100,
                },
            );
        });

        it('filters out pull requests from results', async () => {
            const paginate = vi.fn().mockResolvedValue([
                { number: 1, title: 'Bug fix' },
                { number: 2, title: 'Feature PR', pull_request: { url: 'https://...' } },
                { number: 3, title: 'Enhancement' },
            ]);
            const octokit = makeOctokit({ paginate });

            const result = await fetchIssues(octokit, owner, repo);

            expect(result).toEqual([
                { number: 1, title: 'Bug fix' },
                { number: 3, title: 'Enhancement' },
            ]);
        });

        it('returns empty array when no issues exist', async () => {
            const octokit = makeOctokit({ paginate: vi.fn().mockResolvedValue([]) });

            const result = await fetchIssues(octokit, owner, repo);

            expect(result).toEqual([]);
        });

        it.each([
            { name: '401 Unauthorized', status: 401, message: 'Bad credentials' },
            { name: '404 Not Found', status: 404, message: 'Not Found' },
            { name: '403 Rate Limit', status: 403, message: 'API rate limit exceeded' },
        ])('throws on $name', async ({ status, message }) => {
            const error = new Error(message);
            error.status = status;
            const octokit = makeOctokit({ paginate: vi.fn().mockRejectedValue(error) });

            await expect(fetchIssues(octokit, owner, repo)).rejects.toThrow(message);
        });
    });

    describe('fetchIssueTimeline', () => {
        const issueNumber = 42;

        it('calls paginate with correct endpoint and per_page', async () => {
            const paginate = vi.fn().mockResolvedValue([]);
            const octokit = makeOctokit({ paginate });

            await fetchIssueTimeline(octokit, owner, repo, issueNumber);

            expect(paginate).toHaveBeenCalledWith(
                'GET /repos/{owner}/{repo}/issues/{issue_number}/timeline',
                {
                    owner,
                    repo,
                    issue_number: issueNumber,
                    per_page: 100,
                },
            );
        });

        it('returns timeline events', async () => {
            const events = [
                { event: 'labeled', label: { name: 'bug' } },
                { event: 'closed' },
            ];
            const octokit = makeOctokit({ paginate: vi.fn().mockResolvedValue(events) });

            const result = await fetchIssueTimeline(octokit, owner, repo, issueNumber);

            expect(result).toEqual(events);
        });

        it.each([
            { name: '401 Unauthorized', status: 401, message: 'Bad credentials' },
            { name: '404 Not Found', status: 404, message: 'Not Found' },
            { name: '403 Rate Limit', status: 403, message: 'API rate limit exceeded' },
        ])('throws on $name', async ({ status, message }) => {
            const error = new Error(message);
            error.status = status;
            const octokit = makeOctokit({ paginate: vi.fn().mockRejectedValue(error) });

            await expect(
                fetchIssueTimeline(octokit, owner, repo, issueNumber),
            ).rejects.toThrow(message);
        });
    });

    describe('fetchProjectBoardStatuses', () => {
        const makeGraphqlResponse = (nodes, hasNextPage = false, endCursor = null) => ({
            repository: {
                projectsV2: {
                    nodes: [{
                        items: {
                            pageInfo: { hasNextPage, endCursor },
                            nodes,
                        },
                    }],
                },
            },
        });

        it('sends the GraphQL query with correct variables', async () => {
            const graphql = vi.fn().mockResolvedValue(makeGraphqlResponse([]));
            const octokit = makeOctokit({ graphql });

            await fetchProjectBoardStatuses(octokit, owner, repo);

            expect(graphql).toHaveBeenCalledWith(
                expect.stringContaining('projectsV2'),
                { owner, repo, cursor: null },
            );
        });

        it('returns project board items', async () => {
            const items = [
                { content: { number: 1 }, fieldValueByName: { name: 'In Progress' } },
                { content: { number: 2 }, fieldValueByName: { name: 'Done' } },
            ];
            const graphql = vi.fn().mockResolvedValue(makeGraphqlResponse(items));
            const octokit = makeOctokit({ graphql });

            const result = await fetchProjectBoardStatuses(octokit, owner, repo);

            expect(result).toEqual(items);
        });

        it('handles cursor-based pagination', async () => {
            const page1Items = [{ content: { number: 1 }, fieldValueByName: { name: 'Todo' } }];
            const page2Items = [{ content: { number: 2 }, fieldValueByName: { name: 'Done' } }];
            const graphql = vi.fn()
                .mockResolvedValueOnce(makeGraphqlResponse(page1Items, true, 'cursor-abc'))
                .mockResolvedValueOnce(makeGraphqlResponse(page2Items, false, null));
            const octokit = makeOctokit({ graphql });

            const result = await fetchProjectBoardStatuses(octokit, owner, repo);

            expect(result).toEqual([...page1Items, ...page2Items]);
            expect(graphql).toHaveBeenCalledTimes(2);
            expect(graphql).toHaveBeenNthCalledWith(
                2,
                expect.any(String),
                { owner, repo, cursor: 'cursor-abc' },
            );
        });

        it('returns empty array when no project exists', async () => {
            const graphql = vi.fn().mockResolvedValue({
                repository: { projectsV2: { nodes: [] } },
            });
            const octokit = makeOctokit({ graphql });

            const result = await fetchProjectBoardStatuses(octokit, owner, repo);

            expect(result).toEqual([]);
        });

        it.each([
            { name: '401 Unauthorized', status: 401, message: 'Bad credentials' },
            { name: '404 Not Found', status: 404, message: 'Not Found' },
            { name: '403 Rate Limit', status: 403, message: 'API rate limit exceeded' },
        ])('throws on $name', async ({ status, message }) => {
            const error = new Error(message);
            error.status = status;
            const octokit = makeOctokit({ graphql: vi.fn().mockRejectedValue(error) });

            await expect(
                fetchProjectBoardStatuses(octokit, owner, repo),
            ).rejects.toThrow(message);
        });
    });
});
