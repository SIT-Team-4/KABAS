import * as jiraGateway from '../gateways/jiraGateway.js';

export const fetchProjectIssues = async (projectKey) => {
    if (!projectKey || typeof projectKey !== 'string') {
        throw new Error('Project key is required and must be a string');
    }

    try {
        const issues = await jiraGateway.getPullRequests(projectKey);

        if (!Array.isArray(issues)) {
            return [];
        }

        return issues.map((issue) => ({
            id: issue?.key || 'unknown',
            title: issue?.summary || 'Untitled',
            status: issue?.status?.name || 'Unknown',
            assignee: issue?.assignee?.displayName || 'Unassigned',
            created: issue?.created || null,
            updated: issue?.updated || null,
            url: `${process.env.JIRA_BASE_URL}/browse/${issue?.key || ''}`,
        }));
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to fetch project issues: ${errorMessage}`);
    }
};

export const fetchIssueDetails = async (issueKey) => {
    if (!issueKey || typeof issueKey !== 'string') {
        throw new Error('Issue key is required and must be a string');
    }

    try {
        const issue = await jiraGateway.getIssueDetails(issueKey);

        return {
            id: issue?.key || 'unknown',
            title: issue?.summary || 'Untitled',
            description: issue?.description?.plainText || '',
            status: issue?.status?.name || 'Unknown',
            assignee: issue?.assignee?.displayName || 'Unassigned',
            created: issue?.created || null,
            updated: issue?.updated || null,
            url: `${process.env.JIRA_BASE_URL}/browse/${issue?.key || ''}`,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to fetch issue details: ${errorMessage}`);
    }
};
