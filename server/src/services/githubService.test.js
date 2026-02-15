import {
    describe, it, expect, vi, beforeEach,
} from 'vitest';
import {
    getKanbanData, normalizeIssue, buildColumnMap, translateError,
} from './githubService.js';

vi.mock('octokit', () => ({
    Octokit: vi.fn().mockImplementation(function mock() {
        this.paginate = vi.fn();
        this.graphql = vi.fn();
    }),
}));

vi.mock('../gateways/githubGateway.js', () => ({
    fetchIssues: vi.fn(),
    fetchIssueTimeline: vi.fn(),
    fetchProjectBoardStatuses: vi.fn(),
}));

const { fetchIssues, fetchIssueTimeline, fetchProjectBoardStatuses } = await import('../gateways/githubGateway.js');

const TOKEN = 'ghp_test123';
const OWNER = 'test-org';
const REPO = 'test-repo';

function makeRawIssue(overrides = {}) {
    return {
        number: 42,
        title: 'Fix login bug',
        state: 'open',
        labels: [{ name: 'bug' }, { name: 'priority:high' }],
        assignees: [{ login: 'octocat' }],
        created_at: '2026-01-15T10:30:00Z',
        updated_at: '2026-02-10T14:00:00Z',
        closed_at: null,
        ...overrides,
    };
}

function makeBoardItem(number, status) {
    return {
        content: { number },
        fieldValueByName: { name: status },
    };
}

function makeTimelineEvent(event, extras = {}) {
    return {
        event,
        created_at: '2026-01-20T09:00:00Z',
        ...extras,
    };
}

describe('githubService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('translateError', () => {
        it.each([
            {
                name: 'translates 401 to Invalid GitHub token',
                error: { status: 401 },
                expectedStatus: 401,
                expectedMessage: 'Invalid GitHub token',
            },
            {
                name: 'translates 404 to Repository not found',
                error: { status: 404 },
                expectedStatus: 404,
                expectedMessage: 'Repository not found',
            },
            {
                name: 'translates 403 rate limit to 429',
                error: {
                    status: 403,
                    response: { headers: { 'x-ratelimit-remaining': '0' } },
                },
                expectedStatus: 429,
                expectedMessage: 'GitHub API rate limit exceeded',
            },
            {
                name: 'preserves unknown error status and message',
                error: { status: 502, message: 'Bad Gateway' },
                expectedStatus: 502,
                expectedMessage: 'Bad Gateway',
            },
            {
                name: 'defaults to 500 when no status',
                error: { message: 'Something broke' },
                expectedStatus: 500,
                expectedMessage: 'Something broke',
            },
        ])('$name', ({ error, expectedStatus, expectedMessage }) => {
            const err = translateError(error);

            expect(err).toBeInstanceOf(Error);
            expect(err.message).toBe(expectedMessage);
            expect(err.status).toBe(expectedStatus);
        });
    });

    describe('normalizeIssue', () => {
        it.each([
            {
                name: 'normalizes a full issue with column and timeline',
                raw: makeRawIssue(),
                columnMap: new Map([[42, 'In Progress']]),
                timeline: [
                    makeTimelineEvent('moved_columns_in_project', {
                        project_card: {
                            previous_column_name: 'To Do',
                            column_name: 'In Progress',
                        },
                    }),
                ],
                expected: {
                    number: 42,
                    title: 'Fix login bug',
                    state: 'open',
                    columnName: 'In Progress',
                    labels: ['bug', 'priority:high'],
                    assignees: ['octocat'],
                    createdAt: '2026-01-15T10:30:00Z',
                    updatedAt: '2026-02-10T14:00:00Z',
                    closedAt: null,
                    timelineEvents: [{
                        event: 'moved_columns_in_project',
                        createdAt: '2026-01-20T09:00:00Z',
                        from: 'To Do',
                        to: 'In Progress',
                    }],
                },
            },
            {
                name: 'sets columnName to null when issue has no board entry',
                raw: makeRawIssue(),
                columnMap: new Map(),
                timeline: [],
                expected: expect.objectContaining({ columnName: null }),
            },
            {
                name: 'filters timeline to only column move events',
                raw: makeRawIssue(),
                columnMap: new Map(),
                timeline: [
                    makeTimelineEvent('labeled'),
                    makeTimelineEvent('moved_columns_in_project', {
                        project_card: {
                            previous_column_name: 'To Do',
                            column_name: 'Done',
                        },
                    }),
                    makeTimelineEvent('commented'),
                ],
                expected: expect.objectContaining({
                    timelineEvents: [{
                        event: 'moved_columns_in_project',
                        createdAt: '2026-01-20T09:00:00Z',
                        from: 'To Do',
                        to: 'Done',
                    }],
                }),
            },
            {
                name: 'returns empty timelineEvents when no column moves exist',
                raw: makeRawIssue(),
                columnMap: new Map(),
                timeline: [makeTimelineEvent('labeled'), makeTimelineEvent('commented')],
                expected: expect.objectContaining({ timelineEvents: [] }),
            },
            {
                name: 'handles closed issues with closedAt',
                raw: makeRawIssue({ state: 'closed', closed_at: '2026-02-12T08:00:00Z' }),
                columnMap: new Map(),
                timeline: [],
                expected: expect.objectContaining({
                    state: 'closed',
                    closedAt: '2026-02-12T08:00:00Z',
                }),
            },
            {
                name: 'handles labels as plain strings',
                raw: makeRawIssue({ labels: ['bug', 'urgent'] }),
                columnMap: new Map(),
                timeline: [],
                expected: expect.objectContaining({ labels: ['bug', 'urgent'] }),
            },
        ])('$name', ({ raw, columnMap, timeline, expected }) => {
            const result = normalizeIssue(raw, columnMap, timeline);

            expect(result).toEqual(expected);
        });
    });

    describe('buildColumnMap', () => {
        it.each([
            {
                name: 'maps issue numbers to column names',
                items: [
                    makeBoardItem(1, 'To Do'),
                    makeBoardItem(2, 'In Progress'),
                    makeBoardItem(3, 'Done'),
                ],
                expectedEntries: [[1, 'To Do'], [2, 'In Progress'], [3, 'Done']],
            },
            {
                name: 'skips items without issue number',
                items: [
                    { content: {}, fieldValueByName: { name: 'To Do' } },
                    makeBoardItem(1, 'Done'),
                ],
                expectedEntries: [[1, 'Done']],
            },
            {
                name: 'skips items without status',
                items: [
                    { content: { number: 1 }, fieldValueByName: null },
                    makeBoardItem(2, 'Done'),
                ],
                expectedEntries: [[2, 'Done']],
            },
        ])('$name', ({ items, expectedEntries }) => {
            const map = buildColumnMap(items);

            expect(map.size).toBe(expectedEntries.length);
            expectedEntries.forEach(([key, value]) => {
                expect(map.get(key)).toBe(value);
            });
        });
    });

    describe('getKanbanData', () => {
        it('orchestrates gateway calls and returns normalized data', async () => {
            const rawIssue = makeRawIssue();
            const boardItems = [makeBoardItem(42, 'In Progress')];
            const timeline = [
                makeTimelineEvent('moved_columns_in_project', {
                    project_card: {
                        previous_column_name: 'To Do',
                        column_name: 'In Progress',
                    },
                }),
            ];

            fetchIssues.mockResolvedValue([rawIssue]);
            fetchProjectBoardStatuses.mockResolvedValue(boardItems);
            fetchIssueTimeline.mockResolvedValue(timeline);

            const result = await getKanbanData(TOKEN, OWNER, REPO);

            expect(result.repository).toEqual({ owner: OWNER, repo: REPO });
            expect(result.fetchedAt).toBeDefined();
            expect(result.issues).toHaveLength(1);
            expect(result.issues[0].number).toBe(42);
            expect(result.issues[0].columnName).toBe('In Progress');
            expect(result.issues[0].timelineEvents).toHaveLength(1);

            expect(fetchIssues).toHaveBeenCalledWith(
                expect.anything(),
                OWNER,
                REPO,
            );
            expect(fetchProjectBoardStatuses).toHaveBeenCalledWith(
                expect.anything(),
                OWNER,
                REPO,
            );
            expect(fetchIssueTimeline).toHaveBeenCalledWith(
                expect.anything(),
                OWNER,
                REPO,
                42,
            );
        });

        it('handles multiple issues with different board statuses', async () => {
            const issues = [
                makeRawIssue({ number: 1, title: 'Issue 1' }),
                makeRawIssue({ number: 2, title: 'Issue 2' }),
                makeRawIssue({ number: 3, title: 'Issue 3' }),
            ];
            const boardItems = [
                makeBoardItem(1, 'To Do'),
                makeBoardItem(2, 'In Progress'),
            ];

            fetchIssues.mockResolvedValue(issues);
            fetchProjectBoardStatuses.mockResolvedValue(boardItems);
            fetchIssueTimeline.mockResolvedValue([]);

            const result = await getKanbanData(TOKEN, OWNER, REPO);

            expect(result.issues[0].columnName).toBe('To Do');
            expect(result.issues[1].columnName).toBe('In Progress');
            expect(result.issues[2].columnName).toBeNull();
        });

        it('returns empty issues array when no issues exist', async () => {
            fetchIssues.mockResolvedValue([]);
            fetchProjectBoardStatuses.mockResolvedValue([]);

            const result = await getKanbanData(TOKEN, OWNER, REPO);

            expect(result.issues).toEqual([]);
            expect(fetchIssueTimeline).not.toHaveBeenCalled();
        });

        it.each([
            {
                name: 'translates 401 from fetchIssues',
                setup: () => {
                    const err = new Error('Unauthorized');
                    err.status = 401;
                    fetchIssues.mockRejectedValue(err);
                    fetchProjectBoardStatuses.mockResolvedValue([]);
                },
                expectedMessage: 'Invalid GitHub token',
                expectedStatus: 401,
            },
            {
                name: 'translates 404 from fetchIssues',
                setup: () => {
                    const err = new Error('Not Found');
                    err.status = 404;
                    fetchIssues.mockRejectedValue(err);
                    fetchProjectBoardStatuses.mockResolvedValue([]);
                },
                expectedMessage: 'Repository not found',
                expectedStatus: 404,
            },
            {
                name: 'translates rate limit from fetchIssues',
                setup: () => {
                    const err = new Error('Forbidden');
                    err.status = 403;
                    err.response = { headers: { 'x-ratelimit-remaining': '0' } };
                    fetchIssues.mockRejectedValue(err);
                    fetchProjectBoardStatuses.mockResolvedValue([]);
                },
                expectedMessage: 'GitHub API rate limit exceeded',
                expectedStatus: 429,
            },
        ])('$name', async ({ setup, expectedMessage, expectedStatus }) => {
            setup();

            try {
                await getKanbanData(TOKEN, OWNER, REPO);
                expect.unreachable('should have thrown');
            } catch (err) {
                expect(err.message).toBe(expectedMessage);
                expect(err.status).toBe(expectedStatus);
            }
        });

        it('translates errors from fetchIssueTimeline', async () => {
            fetchIssues.mockResolvedValue([makeRawIssue()]);
            fetchProjectBoardStatuses.mockResolvedValue([]);

            const timelineErr = new Error('Unauthorized');
            timelineErr.status = 401;
            fetchIssueTimeline.mockRejectedValue(timelineErr);

            try {
                await getKanbanData(TOKEN, OWNER, REPO);
                expect.unreachable('should have thrown');
            } catch (err) {
                expect(err.message).toBe('Invalid GitHub token');
                expect(err.status).toBe(401);
            }
        });
    });
});
