/**
 * @module services/analyticsService
 * @description Aggregates task data from Jira or GitHub, normalizes it,
 * persists to the Task model, and computes analytics.
 */
import {
    Team, ClassGroup, TeamCredential, Task,
} from '../models/index.js';
import { createJiraClient } from '../gateways/jiraConfigGateway.js';
import * as jiraService from './jiraService.js';
import * as githubService from './githubService.js';
import { mapStatusToBucket } from '../utils/statusMapper.js';

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Generate initials from a display name.
 * @param {string|null} name - Full display name.
 * @returns {string} Initials string.
 */
function generateInitials(name) {
    if (!name || name.trim() === '' || name === 'Unassigned') {
        return '?';
    }
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }
    return parts.map((p) => p[0].toUpperCase()).join('');
}

/**
 * Extract a Jira project key from a credential baseUrl.
 * @param {string} baseUrl - e.g. "https://site.atlassian.net/projects/KBAS"
 * @returns {string|null} The project key, or null.
 */
function parseJiraProjectKey(baseUrl) {
    if (!baseUrl || typeof baseUrl !== 'string') return null;
    try {
        const url = new URL(baseUrl);
        const segments = url.pathname.split('/').filter(Boolean);
        const projectIdx = segments.indexOf('projects');
        if (projectIdx !== -1 && segments[projectIdx + 1]) {
            return segments[projectIdx + 1];
        }
        // Fall back to last non-empty segment
        if (segments.length > 0) {
            return segments[segments.length - 1];
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Extract owner and repo from a GitHub credential baseUrl.
 * @param {string} baseUrl - e.g. "https://github.com/SIT-Team-4/KABAS"
 * @returns {{ owner: string, repo: string }|null}
 */
function parseGithubOwnerRepo(baseUrl) {
    if (!baseUrl || typeof baseUrl !== 'string') return null;
    try {
        const url = new URL(baseUrl);
        const segments = url.pathname.split('/').filter(Boolean);
        if (segments.length >= 2) {
            return { owner: segments[0], repo: segments[1] };
        }
        return null;
    } catch {
        return null;
    }
}

/**
 * Derive a priority value from an array of label strings.
 * @param {string[]} labels - Issue labels.
 * @returns {string|null} "high", "medium", or "low", or null.
 */
function derivePriorityFromLabels(labels) {
    if (!Array.isArray(labels)) return null;
    const priorities = ['high', 'medium', 'low'];
    let result = null;
    labels.some((label) => {
        const lower = label.toLowerCase();
        const found = priorities.find((p) => lower.includes(p));
        if (found) {
            result = found;
            return true;
        }
        return false;
    });
    return result;
}

/**
 * Find the timestamp when an issue first moved to an in-progress column.
 * @param {Array} timelineEvents - Timeline events with { event, createdAt, from, to }.
 * @returns {string|null} ISO date string or null.
 */
function findStartedAt(timelineEvents) {
    if (!Array.isArray(timelineEvents)) return null;
    const inProgressKeywords = ['in progress', 'in development', 'in review', 'in qa', 'building', 'debugging'];
    const event = timelineEvents.find((e) => {
        if (!e.to) return false;
        const lower = e.to.toLowerCase();
        return inProgressKeywords.some((kw) => lower.includes(kw));
    });
    return event ? event.createdAt : null;
}

/**
 * Normalize a Jira issue into a DB-ready task object.
 * @param {Object} issue - From jiraService.fetchProjectIssues.
 * @param {number} teamId - Team ID.
 * @returns {Object} Task-ready object.
 */
function normalizeJiraIssue(issue, teamId) {
    let bucket = mapStatusToBucket(issue.status);
    // Tasks not in the active sprint are backlog (unless already completed)
    if (!issue.inActiveSprint && bucket !== 'completed') {
        bucket = 'backlog';
    }
    return {
        teamId,
        externalId: issue.id,
        title: issue.title,
        owner: issue.assignee || 'Unassigned',
        ownerInitials: generateInitials(issue.assignee),
        priority: null,
        bucket,
        rawStatus: issue.status,
        createdAt: issue.created,
        startedAt: null,
        completedAt: bucket === 'completed' ? issue.updated : null,
        updatedAt: issue.updated,
        source: 'jira',
        fetchedAt: new Date(),
    };
}

/**
 * Normalize a GitHub issue into a DB-ready task object.
 * @param {Object} issue - From githubService.getKanbanData.
 * @param {number} teamId - Team ID.
 * @returns {Object} Task-ready object.
 */
function normalizeGithubIssue(issue, teamId) {
    return {
        teamId,
        externalId: `GH-${issue.number}`,
        title: issue.title,
        owner: issue.assignees?.[0] || 'Unassigned',
        ownerInitials: generateInitials(issue.assignees?.[0]),
        priority: derivePriorityFromLabels(issue.labels),
        bucket: mapStatusToBucket(issue.columnName || issue.state),
        rawStatus: issue.columnName || issue.state,
        createdAt: issue.createdAt,
        startedAt: findStartedAt(issue.timelineEvents),
        completedAt: issue.closedAt || null,
        updatedAt: issue.updatedAt,
        source: 'github',
        fetchedAt: new Date(),
    };
}

/**
 * Map a snake_case bucket name to camelCase.
 * @param {string} bucket - e.g. "in_progress"
 * @returns {string} camelCase key, e.g. "inProgress"
 */
const BUCKET_TO_CAMEL = {
    todo: 'todo',
    in_progress: 'inProgress',
    completed: 'completed',
    backlog: 'backlog',
};

/**
 * Group tasks by owner and count per bucket.
 * @param {Array} tasks - Array of task objects with `owner` and `bucket`.
 * @returns {Object} e.g. { "Maya Patel": { todo: 3, inProgress: 2, completed: 5, backlog: 1 } }
 */
function computeMemberTaskCounts(tasks) {
    if (!Array.isArray(tasks) || tasks.length === 0) return {};

    return tasks.reduce((acc, task) => {
        const { owner, bucket } = task;
        const camelBucket = BUCKET_TO_CAMEL[bucket] || bucket;
        if (!acc[owner]) {
            acc[owner] = {
                todo: 0, inProgress: 0, completed: 0, backlog: 0,
            };
        }
        acc[owner][camelBucket] = (acc[owner][camelBucket] || 0) + 1;
        return acc;
    }, {});
}

/**
 * Find the member with the highest count for each non-completed status.
 * @param {Object} memberTaskCounts - Output of computeMemberTaskCounts.
 * @returns {Object} { mostTodo, mostInProgress, mostBacklog }
 */
function computeStatusLeaders(memberTaskCounts) {
    const nullResult = { mostTodo: null, mostInProgress: null, mostBacklog: null };
    const members = Object.keys(memberTaskCounts);
    if (members.length === 0) return nullResult;

    const sortedMembers = members.slice().sort();

    const findLeader = (statusKey) => {
        let best = null;
        sortedMembers.forEach((member) => {
            const count = memberTaskCounts[member][statusKey] || 0;
            if (count > 0 && (!best || count > best.count)) {
                best = { member, count };
            }
        });
        return best;
    };

    return {
        mostTodo: findLeader('todo'),
        mostInProgress: findLeader('inProgress'),
        mostBacklog: findLeader('backlog'),
    };
}

/**
 * Compute the difference in days between two dates.
 * @param {string} from - ISO date string.
 * @param {string} to - ISO date string.
 * @returns {number} Days between the two dates.
 */
function diffInDays(from, to) {
    return (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24);
}

/**
 * Compute per-member completion statistics (avg days, stdDev, count).
 * @param {Array} tasks - Array of task objects.
 * @returns {Object} e.g. { "Maya Patel": { avgDays: 4.2, stdDevDays: 1.3, completedCount: 5 } }
 */
function computeCompletionStats(tasks) {
    if (!Array.isArray(tasks) || tasks.length === 0) return {};

    const completedTasks = tasks.filter(
        (t) => t.bucket === 'completed' && t.createdAt && t.completedAt,
    );
    if (completedTasks.length === 0) return {};

    const grouped = completedTasks.reduce((acc, t) => {
        if (!acc[t.owner]) acc[t.owner] = [];
        acc[t.owner].push(diffInDays(t.createdAt, t.completedAt));
        return acc;
    }, {});

    const result = {};
    Object.keys(grouped).forEach((owner) => {
        const days = grouped[owner];
        const n = days.length;
        const sum = days.reduce((s, d) => s + d, 0);
        const avg = sum / n;
        const variance = days.reduce((s, d) => s + (d - avg) ** 2, 0) / n;
        const stdDev = Math.sqrt(variance);

        result[owner] = {
            avgDays: Math.round(avg * 10) / 10,
            stdDevDays: Math.round(stdDev * 10) / 10,
            completedCount: n,
        };
    });

    return result;
}

/**
 * Compute efficiency per member.
 * Efficiency = ((totalTime / totalTasks) / projectDurationDays) * 100
 * @param {Array} tasks - Array of task objects.
 * @param {number|null} projectDurationDays - Total project duration in days.
 * @returns {Object} e.g. { "Maya Patel":
 *   { efficiencyPercent: 12.5, totalTasks: 11, completedTasks: 5 } }
 */
function computeEfficiency(tasks, projectDurationDays) {
    if (!Array.isArray(tasks) || tasks.length === 0) return {};

    // Group all tasks by owner
    const byOwner = tasks.reduce((acc, t) => {
        if (!acc[t.owner]) acc[t.owner] = { all: [], completedDays: [] };
        acc[t.owner].all.push(t);
        if (t.bucket === 'completed' && t.createdAt && t.completedAt) {
            acc[t.owner].completedDays.push(diffInDays(t.createdAt, t.completedAt));
        }
        return acc;
    }, {});

    const result = {};
    Object.keys(byOwner).forEach((owner) => {
        const { all, completedDays } = byOwner[owner];
        const totalTasks = all.length;
        const completedTasks = completedDays.length;

        let efficiencyPercent;
        if (!projectDurationDays) {
            efficiencyPercent = null;
        } else if (completedTasks === 0) {
            efficiencyPercent = 0;
        } else {
            const totalTime = completedDays.reduce((s, d) => s + d, 0);
            efficiencyPercent = Math.round(
                (((totalTime / totalTasks) / projectDurationDays) * 100) * 10,
            ) / 10;
        }

        result[owner] = { efficiencyPercent, totalTasks, completedTasks };
    });

    return result;
}

/**
 * Main orchestrator: fetch, persist, and return analytics for a team.
 * @param {number} teamId - The team's primary key.
 * @returns {Promise<Object>} Analytics payload.
 */
async function getTeamAnalytics(teamId) {
    const team = await Team.findByPk(teamId, {
        include: [
            { model: ClassGroup },
            { model: TeamCredential },
        ],
    });

    if (!team) {
        const err = new Error('Team not found');
        err.status = 404;
        throw err;
    }

    const credential = team.TeamCredential;
    if (!credential) {
        const err = new Error('No credential configured');
        err.status = 404;
        throw err;
    }

    // Check cache freshness
    const latestTask = await Task.findOne({
        where: { teamId },
        order: [['fetchedAt', 'DESC']],
    });
    const isFresh = !!latestTask
        && (Date.now() - new Date(latestTask.fetchedAt).getTime()) < CACHE_TTL_MS;

    // Fetch & persist if stale
    if (!isFresh) {
        let normalized = [];

        if (credential.provider === 'jira') {
            const projectKey = parseJiraProjectKey(credential.baseUrl);
            if (!projectKey) {
                const parseErr = new Error('Invalid Jira baseUrl: could not extract project key');
                parseErr.status = 400;
                throw parseErr;
            }
            const jiraOrigin = new URL(credential.baseUrl).origin;
            const jiraClient = createJiraClient({
                baseUrl: jiraOrigin,
                email: credential.email,
                apiToken: credential.apiToken,
            });
            const issues = await jiraService.fetchProjectIssues(projectKey, { client: jiraClient });
            normalized = issues.map((i) => normalizeJiraIssue(i, teamId));
        } else if (credential.provider === 'github') {
            const parsed = parseGithubOwnerRepo(credential.baseUrl);
            if (!parsed) {
                const parseErr = new Error('Invalid GitHub baseUrl: could not extract owner/repo');
                parseErr.status = 400;
                throw parseErr;
            }
            const { owner, repo } = parsed;
            const data = await githubService.getKanbanData(
                credential.apiToken,
                owner,
                repo,
            );
            normalized = data.issues.map((i) => normalizeGithubIssue(i, teamId));
        }

        // Remove tasks that may have been deleted from the source
        await Task.destroy({ where: { teamId, source: credential.provider } });

        if (normalized.length > 0) {
            await Task.bulkCreate(normalized);
        }
    }

    // Read all stored tasks
    const tasks = await Task.findAll({ where: { teamId }, raw: true });

    // Project duration
    const classGroup = team.ClassGroup;
    const projectDurationDays = classGroup?.startDate && classGroup?.endDate
        ? Math.max(1, Math.ceil(
            (new Date(classGroup.endDate) - new Date(classGroup.startDate))
            / (1000 * 60 * 60 * 24),
        ))
        : null;

    // Compute analytics from raw DB tasks
    const memberTaskCounts = computeMemberTaskCounts(tasks);
    const statusLeaders = computeStatusLeaders(memberTaskCounts);
    const completionStats = computeCompletionStats(tasks);
    const efficiency = computeEfficiency(tasks, projectDurationDays);

    // Map tasks for response
    const responseTasks = tasks.map(({
        id: _dbId, teamId: _teamId, externalId, ...rest
    }) => ({
        id: externalId,
        ...rest,
    }));

    return {
        tasks: responseTasks,
        memberTaskCounts,
        statusLeaders,
        completionStats,
        efficiency,
        meta: {
            source: credential.provider,
            fetchedAt: new Date().toISOString(),
            projectDurationDays,
            cached: isFresh,
        },
    };
}

/**
 * Compute a summary object for a single team and its tasks.
 * @param {Object} team - Team with ClassGroup and TeamCredential associations.
 * @param {Array} tasks - Array of task objects for this team.
 * @returns {Object} Team summary.
 */
function computeTeamSummary(team, tasks) {
    // Count buckets
    const todoCount = tasks.filter((t) => t.bucket === 'todo').length;
    const inProgressCount = tasks.filter((t) => t.bucket === 'in_progress').length;
    const completedCount = tasks.filter((t) => t.bucket === 'completed').length;
    const backlogCount = tasks.filter((t) => t.bucket === 'backlog').length;

    // Unique non-"Unassigned" owners
    const memberCount = new Set(
        tasks.map((t) => t.owner).filter((o) => o && o !== 'Unassigned'),
    ).size;

    // Average completion days across all members
    const completionStats = computeCompletionStats(tasks);
    const completionValues = Object.values(completionStats);
    const completionSum = completionValues
        .reduce((s, v) => s + v.avgDays, 0);
    const avgCompletionDays = completionValues.length > 0
        ? Math.round((completionSum / completionValues.length) * 10) / 10
        : null;

    // Average efficiency across all members (exclude nulls)
    const classGroup = team.ClassGroup;
    const durationMs = classGroup?.startDate && classGroup?.endDate
        ? new Date(classGroup.endDate) - new Date(classGroup.startDate)
        : null;
    const projectDurationDays = durationMs != null
        ? Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)))
        : null;
    const efficiencyStats = computeEfficiency(tasks, projectDurationDays);
    const effValues = Object.values(efficiencyStats)
        .filter((v) => v.efficiencyPercent != null);
    const effSum = effValues
        .reduce((s, v) => s + v.efficiencyPercent, 0);
    const avgEfficiency = effValues.length > 0
        ? Math.round((effSum / effValues.length) * 10) / 10
        : null;

    // Last fetched
    const fetchedDates = tasks.map((t) => t.fetchedAt)
        .filter(Boolean)
        .map((d) => new Date(d).getTime());
    const lastFetchedAt = fetchedDates.length > 0
        ? new Date(Math.max(...fetchedDates)).toISOString()
        : null;

    return {
        teamId: team.id,
        teamName: team.name,
        classGroupId: classGroup?.id || null,
        classGroupName: classGroup?.name || null,
        source: team.TeamCredential?.provider || null,
        totalTasks: tasks.length,
        todoCount,
        inProgressCount,
        completedCount,
        backlogCount,
        memberCount,
        avgCompletionDays,
        avgEfficiency,
        lastFetchedAt,
    };
}

/**
 * Compute aggregate statistics across multiple team summaries.
 * @param {Array} teamSummaries - Array of team summary objects from computeTeamSummary.
 * @returns {Object} Cohort aggregate.
 */
function computeCohortAggregate(teamSummaries) {
    if (teamSummaries.length === 0) {
        return {
            totalTeams: 0,
            totalTasks: 0,
            totalTodo: 0,
            totalInProgress: 0,
            totalCompleted: 0,
            totalBacklog: 0,
            avgCompletionDays: null,
            avgEfficiency: null,
        };
    }

    const totalTeams = teamSummaries.length;
    const totalTasks = teamSummaries.reduce((s, t) => s + t.totalTasks, 0);
    const totalTodo = teamSummaries.reduce((s, t) => s + t.todoCount, 0);
    const totalInProgress = teamSummaries.reduce((s, t) => s + t.inProgressCount, 0);
    const totalCompleted = teamSummaries.reduce((s, t) => s + t.completedCount, 0);
    const totalBacklog = teamSummaries.reduce((s, t) => s + t.backlogCount, 0);

    // Weighted average completion days (by completedCount per team)
    const completionTeams = teamSummaries.filter(
        (t) => t.avgCompletionDays != null && t.completedCount > 0,
    );
    const totalCompletedWeight = completionTeams
        .reduce((s, t) => s + t.completedCount, 0);
    const weightedCompletionSum = completionTeams
        .reduce((s, t) => s + t.avgCompletionDays * t.completedCount, 0);
    const avgCompletionDays = totalCompletedWeight > 0
        ? Math.round((weightedCompletionSum / totalCompletedWeight) * 10) / 10
        : null;

    // Weighted average efficiency (by totalTasks per team)
    const effTeams = teamSummaries.filter(
        (t) => t.avgEfficiency != null && t.totalTasks > 0,
    );
    const totalEffWeight = effTeams
        .reduce((s, t) => s + t.totalTasks, 0);
    const weightedEffSum = effTeams
        .reduce((s, t) => s + t.avgEfficiency * t.totalTasks, 0);
    const avgEfficiency = totalEffWeight > 0
        ? Math.round((weightedEffSum / totalEffWeight) * 10) / 10
        : null;

    return {
        totalTeams,
        totalTasks,
        totalTodo,
        totalInProgress,
        totalCompleted,
        totalBacklog,
        avgCompletionDays,
        avgEfficiency,
    };
}

/**
 * Fetch analytics for all teams, optionally filtered by classGroupId.
 * @param {Object} [options] - Options object.
 * @param {number} [options.classGroupId] - Filter by class group ID.
 * @returns {Promise<Object>} { teams: TeamSummary[], cohort: CohortAggregate }
 */
async function getAllTeamsAnalytics({ classGroupId } = {}) {
    const where = classGroupId ? { classGroupId } : {};
    const teams = await Team.findAll({
        where,
        include: [{ model: ClassGroup }, { model: TeamCredential }],
    });

    const teamIds = teams.map((t) => t.id);
    const allTasks = teamIds.length > 0
        ? await Task.findAll({ where: { teamId: teamIds }, raw: true })
        : [];

    const tasksByTeam = allTasks.reduce((acc, task) => {
        if (!acc[task.teamId]) acc[task.teamId] = [];
        acc[task.teamId].push(task);
        return acc;
    }, {});

    const teamSummaries = teams.map((team) => computeTeamSummary(team, tasksByTeam[team.id] || []));
    const cohort = computeCohortAggregate(teamSummaries);

    return { teams: teamSummaries, cohort };
}

export {
    getTeamAnalytics,
    normalizeJiraIssue,
    normalizeGithubIssue,
    generateInitials,
    parseJiraProjectKey,
    parseGithubOwnerRepo,
    derivePriorityFromLabels,
    findStartedAt,
    computeMemberTaskCounts,
    computeStatusLeaders,
    computeCompletionStats,
    computeEfficiency,
    computeTeamSummary,
    computeCohortAggregate,
    getAllTeamsAnalytics,
};
