import {
    describe, it, expect, vi, beforeEach,
} from 'vitest';
import {
    generateInitials,
    parseJiraProjectKey,
    parseGithubOwnerRepo,
    derivePriorityFromLabels,
    normalizeJiraIssue,
    normalizeGithubIssue,
    getTeamAnalytics,
    findStartedAt,
    computeMemberTaskCounts,
    computeStatusLeaders,
    computeCompletionStats,
    computeEfficiency,
} from './analyticsService.js';

vi.mock('../models/index.js', () => ({
    Team: { findByPk: vi.fn() },
    Task: {
        findOne: vi.fn(), findAll: vi.fn(), bulkCreate: vi.fn(), destroy: vi.fn(),
    },
    ClassGroup: {},
    TeamCredential: {},
}));

vi.mock('../gateways/jiraConfigGateway.js', () => ({
    createJiraClient: vi.fn(),
}));

vi.mock('./jiraService.js', () => ({
    fetchProjectIssues: vi.fn(),
}));

vi.mock('./githubService.js', () => ({
    getKanbanData: vi.fn(),
}));

// Import mocked modules for assertions
import { Team, Task } from '../models/index.js';
import { createJiraClient } from '../gateways/jiraConfigGateway.js';
import * as jiraService from './jiraService.js';
import * as githubService from './githubService.js';

beforeEach(() => {
    vi.clearAllMocks();
});

describe('generateInitials', () => {
    it('should return initials for a full name', () => {
        expect(generateInitials('Maya Patel')).toBe('MP');
    });

    it('should return first two chars for a single name', () => {
        expect(generateInitials('Alice')).toBe('AL');
    });

    it('should return "?" for "Unassigned"', () => {
        expect(generateInitials('Unassigned')).toBe('?');
    });

    it('should return "?" for null', () => {
        expect(generateInitials(null)).toBe('?');
    });

    it('should return "?" for empty string', () => {
        expect(generateInitials('')).toBe('?');
    });

    it('should handle three-part names', () => {
        expect(generateInitials('John Bob Smith')).toBe('JBS');
    });
});

describe('parseJiraProjectKey', () => {
    it('should extract project key from URL with /projects/ path', () => {
        expect(parseJiraProjectKey('https://site.atlassian.net/projects/KBAS')).toBe('KBAS');
    });

    it('should return null for invalid URL', () => {
        expect(parseJiraProjectKey('not a url')).toBeNull();
    });

    it('should return null for null input', () => {
        expect(parseJiraProjectKey(null)).toBeNull();
    });

    it('should return last segment if no /projects/ path', () => {
        expect(parseJiraProjectKey('https://site.atlassian.net/KBAS')).toBe('KBAS');
    });
});

describe('parseGithubOwnerRepo', () => {
    it('should extract owner and repo from GitHub URL', () => {
        expect(parseGithubOwnerRepo('https://github.com/SIT-Team-4/KABAS')).toEqual({
            owner: 'SIT-Team-4',
            repo: 'KABAS',
        });
    });

    it('should return null for invalid URL', () => {
        expect(parseGithubOwnerRepo('not a url')).toBeNull();
    });

    it('should return null for URL with only one segment', () => {
        expect(parseGithubOwnerRepo('https://github.com/owner')).toBeNull();
    });
});

describe('derivePriorityFromLabels', () => {
    it('should find "high" in labels', () => {
        expect(derivePriorityFromLabels(['bug', 'priority:high', 'urgent'])).toBe('high');
    });

    it('should find "medium" in labels', () => {
        expect(derivePriorityFromLabels(['Medium Priority'])).toBe('medium');
    });

    it('should find "low" in labels', () => {
        expect(derivePriorityFromLabels(['low-priority'])).toBe('low');
    });

    it('should return null when no match', () => {
        expect(derivePriorityFromLabels(['bug', 'feature'])).toBeNull();
    });

    it('should return null for empty array', () => {
        expect(derivePriorityFromLabels([])).toBeNull();
    });
});

describe('normalizeJiraIssue', () => {
    it('should map all fields correctly', () => {
        const issue = {
            id: 'KBAS-42',
            title: 'Fix login',
            status: 'In Progress',
            assignee: 'Maya Patel',
            created: '2026-01-10',
            updated: '2026-01-15',
        };
        const result = normalizeJiraIssue(issue, 1);

        expect(result.teamId).toBe(1);
        expect(result.externalId).toBe('KBAS-42');
        expect(result.title).toBe('Fix login');
        expect(result.owner).toBe('Maya Patel');
        expect(result.ownerInitials).toBe('MP');
        expect(result.priority).toBeNull();
        expect(result.bucket).toBe('in_progress');
        expect(result.rawStatus).toBe('In Progress');
        expect(result.source).toBe('jira');
        expect(result.completedAt).toBeNull();
    });

    it('should set completedAt for completed issues', () => {
        const issue = {
            id: 'KBAS-43',
            title: 'Done task',
            status: 'Done',
            assignee: 'Alice',
            created: '2026-01-10',
            updated: '2026-01-20',
        };
        const result = normalizeJiraIssue(issue, 1);

        expect(result.bucket).toBe('completed');
        expect(result.completedAt).toBe('2026-01-20');
    });

    it('should handle missing assignee', () => {
        const issue = {
            id: 'KBAS-44',
            title: 'No owner',
            status: 'To Do',
            assignee: null,
            created: '2026-01-10',
            updated: '2026-01-10',
        };
        const result = normalizeJiraIssue(issue, 1);

        expect(result.owner).toBe('Unassigned');
        expect(result.ownerInitials).toBe('?');
    });
});

describe('normalizeGithubIssue', () => {
    it('should map all fields correctly', () => {
        const issue = {
            number: 5,
            title: 'Add feature',
            state: 'open',
            columnName: 'In Progress',
            labels: ['priority:high'],
            assignees: ['alice'],
            createdAt: '2026-01-10',
            updatedAt: '2026-01-15',
            closedAt: null,
            timelineEvents: [],
        };
        const result = normalizeGithubIssue(issue, 2);

        expect(result.teamId).toBe(2);
        expect(result.externalId).toBe('GH-5');
        expect(result.title).toBe('Add feature');
        expect(result.owner).toBe('alice');
        expect(result.priority).toBe('high');
        expect(result.bucket).toBe('in_progress');
        expect(result.rawStatus).toBe('In Progress');
        expect(result.source).toBe('github');
    });

    it('should fall back to state when columnName is null', () => {
        const issue = {
            number: 6,
            title: 'Bug',
            state: 'closed',
            columnName: null,
            labels: [],
            assignees: [],
            createdAt: '2026-01-10',
            updatedAt: '2026-01-15',
            closedAt: '2026-01-15',
            timelineEvents: [],
        };
        const result = normalizeGithubIssue(issue, 2);

        expect(result.owner).toBe('Unassigned');
        expect(result.ownerInitials).toBe('?');
        expect(result.rawStatus).toBe('closed');
        expect(result.completedAt).toBe('2026-01-15');
    });

    it('should detect startedAt from timeline events', () => {
        const issue = {
            number: 7,
            title: 'Timeline test',
            state: 'open',
            columnName: 'In Progress',
            labels: [],
            assignees: ['bob'],
            createdAt: '2026-01-10',
            updatedAt: '2026-01-15',
            closedAt: null,
            timelineEvents: [
                { event: 'moved_columns_in_project', createdAt: '2026-01-12', from: 'To Do', to: 'In Progress' },
            ],
        };
        const result = normalizeGithubIssue(issue, 2);

        expect(result.startedAt).toBe('2026-01-12');
    });
});

describe('findStartedAt', () => {
    it('should return null for empty events', () => {
        expect(findStartedAt([])).toBeNull();
    });

    it('should return null for null input', () => {
        expect(findStartedAt(null)).toBeNull();
    });
});

describe('getTeamAnalytics', () => {
    const mockCredentialJira = {
        provider: 'jira',
        baseUrl: 'https://site.atlassian.net/projects/KBAS',
        email: 'test@example.com',
        apiToken: 'token123',
    };

    const mockCredentialGithub = {
        provider: 'github',
        baseUrl: 'https://github.com/SIT-Team-4/KABAS',
        apiToken: 'ghp_token123',
    };

    const mockTeamBase = {
        id: 1,
        ClassGroup: { startDate: '2026-01-01', endDate: '2026-03-01' },
    };

    it('should throw 404 when team not found', async () => {
        vi.mocked(Team.findByPk).mockResolvedValue(null);

        await expect(getTeamAnalytics(999)).rejects.toThrow('Team not found');

        try {
            await getTeamAnalytics(999);
        } catch (err) {
            expect(err.status).toBe(404);
        }
    });

    it('should throw 404 when no credential configured', async () => {
        vi.mocked(Team.findByPk).mockResolvedValue({
            ...mockTeamBase,
            TeamCredential: null,
        });

        await expect(getTeamAnalytics(1)).rejects.toThrow('No credential configured');

        try {
            await getTeamAnalytics(1);
        } catch (err) {
            expect(err.status).toBe(404);
        }
    });

    it('should return cached tasks without fetching when fresh', async () => {
        vi.mocked(Team.findByPk).mockResolvedValue({
            ...mockTeamBase,
            TeamCredential: mockCredentialJira,
        });
        vi.mocked(Task.findOne).mockResolvedValue({
            fetchedAt: new Date(), // fresh
        });
        vi.mocked(Task.findAll).mockResolvedValue([
            {
                id: 1, teamId: 1, externalId: 'KBAS-1', title: 'Task 1', bucket: 'todo', source: 'jira',
            },
        ]);

        const result = await getTeamAnalytics(1);

        expect(jiraService.fetchProjectIssues).not.toHaveBeenCalled();
        expect(githubService.getKanbanData).not.toHaveBeenCalled();
        expect(result.meta.cached).toBe(true);
        expect(result.tasks).toHaveLength(1);
        expect(result.tasks[0].id).toBe('KBAS-1');
        expect(result.tasks[0]).not.toHaveProperty('teamId');
    });

    it('should fetch from Jira when cache is stale', async () => {
        const mockJiraClient = { post: vi.fn() };
        vi.mocked(createJiraClient).mockReturnValue(mockJiraClient);
        vi.mocked(Team.findByPk).mockResolvedValue({
            ...mockTeamBase,
            TeamCredential: mockCredentialJira,
        });
        vi.mocked(Task.findOne).mockResolvedValue(null); // no cache
        vi.mocked(Task.destroy).mockResolvedValue(0);
        vi.mocked(jiraService.fetchProjectIssues).mockResolvedValue([
            {
                id: 'KBAS-10',
                title: 'Jira Task',
                status: 'To Do',
                assignee: 'Alice',
                created: '2026-01-10',
                updated: '2026-01-15',
            },
        ]);
        vi.mocked(Task.bulkCreate).mockResolvedValue();
        vi.mocked(Task.findAll).mockResolvedValue([
            {
                id: 1, teamId: 1, externalId: 'KBAS-10', title: 'Jira Task', bucket: 'todo', source: 'jira',
            },
        ]);

        const result = await getTeamAnalytics(1);

        expect(createJiraClient).toHaveBeenCalledWith({
            baseUrl: mockCredentialJira.baseUrl,
            email: mockCredentialJira.email,
            apiToken: mockCredentialJira.apiToken,
        });
        expect(jiraService.fetchProjectIssues).toHaveBeenCalledWith('KBAS', { client: mockJiraClient });
        expect(Task.bulkCreate).toHaveBeenCalled();
        expect(result.meta.source).toBe('jira');
        expect(result.meta.cached).toBe(false);
        expect(result.meta.projectDurationDays).toBe(59);
        expect(result.tasks).toHaveLength(1);
    });

    it('should fetch from GitHub when cache is stale', async () => {
        vi.mocked(Team.findByPk).mockResolvedValue({
            ...mockTeamBase,
            TeamCredential: mockCredentialGithub,
        });
        vi.mocked(Task.findOne).mockResolvedValue(null); // no cache
        vi.mocked(Task.destroy).mockResolvedValue(0);
        vi.mocked(githubService.getKanbanData).mockResolvedValue({
            repository: { owner: 'SIT-Team-4', repo: 'KABAS' },
            fetchedAt: new Date().toISOString(),
            issues: [
                {
                    number: 1,
                    title: 'GitHub Task',
                    state: 'open',
                    columnName: 'To Do',
                    labels: ['priority:high'],
                    assignees: ['bob'],
                    createdAt: '2026-01-10',
                    updatedAt: '2026-01-15',
                    closedAt: null,
                    timelineEvents: [],
                },
            ],
        });
        vi.mocked(Task.bulkCreate).mockResolvedValue();
        vi.mocked(Task.findAll).mockResolvedValue([
            {
                id: 1, teamId: 1, externalId: 'GH-1', title: 'GitHub Task', bucket: 'todo', source: 'github',
            },
        ]);

        const result = await getTeamAnalytics(1);

        expect(githubService.getKanbanData).toHaveBeenCalledWith(
            mockCredentialGithub.apiToken,
            'SIT-Team-4',
            'KABAS',
        );
        expect(Task.bulkCreate).toHaveBeenCalled();
        expect(result.meta.source).toBe('github');
        expect(result.meta.cached).toBe(false);
        expect(result.tasks).toHaveLength(1);
        expect(result.tasks[0].id).toBe('GH-1');
    });

    it('should throw 400 when Jira baseUrl has no project key', async () => {
        vi.mocked(Team.findByPk).mockResolvedValue({
            ...mockTeamBase,
            TeamCredential: { ...mockCredentialJira, baseUrl: 'https://site.atlassian.net' },
        });
        vi.mocked(Task.findOne).mockResolvedValue(null);

        try {
            await getTeamAnalytics(1);
        } catch (err) {
            expect(err.message).toBe('Invalid Jira baseUrl: could not extract project key');
            expect(err.status).toBe(400);
        }
    });

    it('should throw 400 when GitHub baseUrl is invalid', async () => {
        vi.mocked(Team.findByPk).mockResolvedValue({
            ...mockTeamBase,
            TeamCredential: { ...mockCredentialGithub, baseUrl: 'https://github.com' },
        });
        vi.mocked(Task.findOne).mockResolvedValue(null);

        try {
            await getTeamAnalytics(1);
        } catch (err) {
            expect(err.message).toBe('Invalid GitHub baseUrl: could not extract owner/repo');
            expect(err.status).toBe(400);
        }
    });

    it('should delete old tasks before inserting fresh ones', async () => {
        vi.mocked(createJiraClient).mockReturnValue({ post: vi.fn() });
        vi.mocked(Team.findByPk).mockResolvedValue({
            ...mockTeamBase,
            TeamCredential: mockCredentialJira,
        });
        vi.mocked(Task.findOne).mockResolvedValue(null);
        vi.mocked(Task.destroy).mockResolvedValue(5);
        vi.mocked(jiraService.fetchProjectIssues).mockResolvedValue([
            {
                id: 'KBAS-10', title: 'Task', status: 'To Do', assignee: 'Alice', created: '2026-01-10', updated: '2026-01-15',
            },
        ]);
        vi.mocked(Task.bulkCreate).mockResolvedValue();
        vi.mocked(Task.findAll).mockResolvedValue([]);

        await getTeamAnalytics(1);

        expect(Task.destroy).toHaveBeenCalledWith({ where: { teamId: 1, source: 'jira' } });
        expect(Task.bulkCreate).toHaveBeenCalled();
    });

    it('should handle null classGroup dates for projectDurationDays', async () => {
        vi.mocked(Team.findByPk).mockResolvedValue({
            id: 1,
            ClassGroup: {},
            TeamCredential: mockCredentialJira,
        });
        vi.mocked(Task.findOne).mockResolvedValue({ fetchedAt: new Date() });
        vi.mocked(Task.findAll).mockResolvedValue([]);

        const result = await getTeamAnalytics(1);

        expect(result.meta.projectDurationDays).toBeNull();
    });
});

// ─── Task 4: Status Rankings (KBAS-37) ─────────────────────────────

describe('computeMemberTaskCounts', () => {
    it('should group tasks by owner and count per bucket', () => {
        const tasks = [
            { owner: 'Maya Patel', bucket: 'todo' },
            { owner: 'Maya Patel', bucket: 'todo' },
            { owner: 'Maya Patel', bucket: 'in_progress' },
            { owner: 'Maya Patel', bucket: 'completed' },
            { owner: 'Alex', bucket: 'backlog' },
            { owner: 'Alex', bucket: 'completed' },
            { owner: 'Alex', bucket: 'completed' },
        ];
        const result = computeMemberTaskCounts(tasks);

        expect(result['Maya Patel']).toEqual({
            todo: 2, inProgress: 1, completed: 1, backlog: 0,
        });
        expect(result.Alex).toEqual({
            todo: 0, inProgress: 0, completed: 2, backlog: 1,
        });
    });

    it('should return empty object for empty array', () => {
        expect(computeMemberTaskCounts([])).toEqual({});
    });

    it('should return empty object for null input', () => {
        expect(computeMemberTaskCounts(null)).toEqual({});
    });
});

describe('computeStatusLeaders', () => {
    it('should find the leader for each non-completed status', () => {
        const counts = {
            'Maya Patel': {
                todo: 3, inProgress: 2, completed: 5, backlog: 1,
            },
            Alex: {
                todo: 1, inProgress: 4, completed: 3, backlog: 0,
            },
            Sam: {
                todo: 1, inProgress: 1, completed: 2, backlog: 2,
            },
        };
        const result = computeStatusLeaders(counts);

        expect(result.mostTodo).toEqual({ member: 'Maya Patel', count: 3 });
        expect(result.mostInProgress).toEqual({ member: 'Alex', count: 4 });
        expect(result.mostBacklog).toEqual({ member: 'Sam', count: 2 });
    });

    it('should pick alphabetically first member on ties', () => {
        const counts = {
            Charlie: {
                todo: 3, inProgress: 0, completed: 0, backlog: 0,
            },
            Alice: {
                todo: 3, inProgress: 0, completed: 0, backlog: 0,
            },
            Bob: {
                todo: 3, inProgress: 0, completed: 0, backlog: 0,
            },
        };
        const result = computeStatusLeaders(counts);

        expect(result.mostTodo).toEqual({ member: 'Alice', count: 3 });
    });

    it('should return all null for empty input', () => {
        const result = computeStatusLeaders({});

        expect(result).toEqual({
            mostTodo: null, mostInProgress: null, mostBacklog: null,
        });
    });
});

// ─── Task 5: Completion Stats (KBAS-38) ────────────────────────────

describe('computeCompletionStats', () => {
    it('should compute avg and stddev for a single member with multiple tasks', () => {
        const tasks = [
            {
                owner: 'Maya', bucket: 'completed', createdAt: '2026-01-01', completedAt: '2026-01-05',
            }, // 4 days
            {
                owner: 'Maya', bucket: 'completed', createdAt: '2026-01-01', completedAt: '2026-01-07',
            }, // 6 days
        ];
        const result = computeCompletionStats(tasks);

        expect(result.Maya.avgDays).toBe(5);
        expect(result.Maya.stdDevDays).toBe(1);
        expect(result.Maya.completedCount).toBe(2);
    });

    it('should compute stats for multiple members', () => {
        const tasks = [
            {
                owner: 'Alice', bucket: 'completed', createdAt: '2026-01-01', completedAt: '2026-01-11',
            }, // 10 days
            {
                owner: 'Bob', bucket: 'completed', createdAt: '2026-01-01', completedAt: '2026-01-04',
            }, // 3 days
        ];
        const result = computeCompletionStats(tasks);

        expect(result.Alice).toEqual({ avgDays: 10, stdDevDays: 0, completedCount: 1 });
        expect(result.Bob).toEqual({ avgDays: 3, stdDevDays: 0, completedCount: 1 });
    });

    it('should return empty object when no completed tasks', () => {
        const tasks = [
            { owner: 'Alice', bucket: 'todo', createdAt: '2026-01-01' },
        ];
        expect(computeCompletionStats(tasks)).toEqual({});
    });

    it('should return stdDev 0 when all tasks have the same duration', () => {
        const tasks = [
            {
                owner: 'Alice', bucket: 'completed', createdAt: '2026-01-01', completedAt: '2026-01-06',
            },
            {
                owner: 'Alice', bucket: 'completed', createdAt: '2026-02-01', completedAt: '2026-02-06',
            },
        ];
        const result = computeCompletionStats(tasks);

        expect(result.Alice.stdDevDays).toBe(0);
    });

    it('should filter out tasks missing createdAt or completedAt', () => {
        const tasks = [
            {
                owner: 'Alice', bucket: 'completed', createdAt: null, completedAt: '2026-01-06',
            },
            {
                owner: 'Alice', bucket: 'completed', createdAt: '2026-01-01', completedAt: null,
            },
            {
                owner: 'Alice', bucket: 'completed', createdAt: '2026-01-01', completedAt: '2026-01-04',
            }, // 3 days
        ];
        const result = computeCompletionStats(tasks);

        expect(result.Alice.completedCount).toBe(1);
        expect(result.Alice.avgDays).toBe(3);
    });

    it('should return empty object for empty array', () => {
        expect(computeCompletionStats([])).toEqual({});
    });
});

// ─── Task 6: Efficiency (KBAS-39) ──────────────────────────────────

describe('computeEfficiency', () => {
    it('should compute efficiency for a mix of completed and incomplete tasks', () => {
        const tasks = [
            {
                owner: 'Maya', bucket: 'completed', createdAt: '2026-01-01', completedAt: '2026-01-11',
            }, // 10 days
            {
                owner: 'Maya', bucket: 'completed', createdAt: '2026-01-01', completedAt: '2026-01-06',
            }, // 5 days
            { owner: 'Maya', bucket: 'todo' },
            { owner: 'Maya', bucket: 'in_progress' },
        ];
        // totalTime=15, totalTasks=4, avgTime=3.75, projectDuration=100
        // efficiency = (3.75/100)*100 = 3.75 → 3.8 rounded
        const result = computeEfficiency(tasks, 100);

        expect(result.Maya.totalTasks).toBe(4);
        expect(result.Maya.completedTasks).toBe(2);
        expect(result.Maya.efficiencyPercent).toBe(3.8);
    });

    it('should return efficiencyPercent 0 when member has no completed tasks', () => {
        const tasks = [
            { owner: 'Bob', bucket: 'todo' },
            { owner: 'Bob', bucket: 'in_progress' },
        ];
        const result = computeEfficiency(tasks, 60);

        expect(result.Bob.efficiencyPercent).toBe(0);
        expect(result.Bob.totalTasks).toBe(2);
        expect(result.Bob.completedTasks).toBe(0);
    });

    it('should return efficiencyPercent null when projectDurationDays is 0', () => {
        const tasks = [
            {
                owner: 'Alice', bucket: 'completed', createdAt: '2026-01-01', completedAt: '2026-01-06',
            },
        ];
        const result = computeEfficiency(tasks, 0);

        expect(result.Alice.efficiencyPercent).toBeNull();
    });

    it('should return efficiencyPercent null when projectDurationDays is null', () => {
        const tasks = [
            {
                owner: 'Alice', bucket: 'completed', createdAt: '2026-01-01', completedAt: '2026-01-06',
            },
        ];
        const result = computeEfficiency(tasks, null);

        expect(result.Alice.efficiencyPercent).toBeNull();
    });

    it('should handle member with only incomplete tasks', () => {
        const tasks = [
            { owner: 'Sam', bucket: 'backlog' },
        ];
        const result = computeEfficiency(tasks, 30);

        expect(result.Sam).toEqual({ efficiencyPercent: 0, totalTasks: 1, completedTasks: 0 });
    });

    it('should return empty object for empty tasks array', () => {
        expect(computeEfficiency([], 30)).toEqual({});
    });
});
