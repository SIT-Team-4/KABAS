import { Octokit } from 'octokit';
import {
    fetchIssues,
    fetchIssueTimeline,
    fetchProjectBoardStatuses,
} from '../gateways/githubGateway.js';

const TIMELINE_BATCH_SIZE = 10;

function translateError(error) {
    const status = error.status || 500;
    const isRateLimit = status === 403
        && error.response?.headers?.['x-ratelimit-remaining'] === '0';

    if (isRateLimit) {
        const err = new Error('GitHub API rate limit exceeded');
        err.status = 429;
        return err;
    }

    const messageMap = {
        401: 'Invalid GitHub token',
        404: 'Repository not found',
    };

    const message = messageMap[status] || error.message || 'Internal Server Error';
    const err = new Error(message);
    err.status = status;
    return err;
}

function normalizeIssue(raw, columnMap, timelineEvents) {
    return {
        number: raw.number,
        title: raw.title,
        state: raw.state,
        columnName: columnMap.get(raw.number) || null,
        labels: raw.labels.map((l) => (typeof l === 'string' ? l : l.name)),
        assignees: raw.assignees.map((a) => a.login),
        createdAt: raw.created_at,
        updatedAt: raw.updated_at,
        closedAt: raw.closed_at || null,
        timelineEvents: timelineEvents
            .filter((e) => e.event === 'moved_columns_in_project')
            .map((e) => ({
                event: e.event,
                createdAt: e.created_at,
                from: e.project_card?.previous_column_name || null,
                to: e.project_card?.column_name || null,
            })),
    };
}

function buildColumnMap(boardItems) {
    const map = new Map();
    boardItems.forEach((item) => {
        const issueNumber = item.content?.number;
        const status = item.fieldValueByName?.name;
        if (issueNumber != null && status) {
            map.set(issueNumber, status);
        }
    });
    return map;
}

async function getKanbanData(token, owner, repo) {
    const octokit = new Octokit({ auth: token });
    let issues;
    let boardItems;

    try {
        [issues, boardItems] = await Promise.all([
            fetchIssues(octokit, owner, repo),
            fetchProjectBoardStatuses(octokit, owner, repo),
        ]);
    } catch (error) {
        throw translateError(error);
    }

    const columnMap = buildColumnMap(boardItems);

    const normalizedIssues = [];
    for (let i = 0; i < issues.length; i += TIMELINE_BATCH_SIZE) {
        const batch = issues.slice(i, i + TIMELINE_BATCH_SIZE);
        // eslint-disable-next-line no-await-in-loop
        const timelines = await Promise.all(
            batch.map(async (issue) => {
                try {
                    return await fetchIssueTimeline(
                        octokit,
                        owner,
                        repo,
                        issue.number,
                    );
                } catch (error) {
                    throw translateError(error);
                }
            }),
        );
        batch.forEach((issue, idx) => {
            normalizedIssues.push(normalizeIssue(issue, columnMap, timelines[idx]));
        });
    }

    return {
        repository: { owner, repo },
        fetchedAt: new Date().toISOString(),
        issues: normalizedIssues,
    };
}

export {
    getKanbanData,
    normalizeIssue,
    buildColumnMap,
    translateError,
};
