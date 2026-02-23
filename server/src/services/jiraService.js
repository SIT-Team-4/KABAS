import * as jiraGateway from '../gateways/jiraGateway.js';

const JIRA_BASE_URL = process.env.JIRA_BASE_URL ?? '';

/**
 * Fetch all issues for a Jira project and normalize them.
 * @param {string} projectKey - The Jira project key (e.g. "KBAS").
 * @returns {Promise<Array<Object>>} Array of normalized issue objects.
 * @throws {Error} If projectKey is invalid or the API call fails.
 */
export const fetchProjectIssues = async (projectKey) => {
    if (!projectKey || typeof projectKey !== 'string') {
        throw new Error('Project key is required and must be a string');
    }

    try {
        const issues = await jiraGateway.getIssues(projectKey);

        if (!Array.isArray(issues)) {
            return [];
        }

        return issues.map((issue) => {
            const fields = issue?.fields || {};
            return {
                id: issue?.key || 'unknown',
                title: fields?.summary || 'Untitled',
                status: fields?.status?.name || 'Unknown',
                assignee: fields?.assignee?.displayName || 'Unassigned',
                created: fields?.created || null,
                updated: fields?.updated || null,
                url: JIRA_BASE_URL ? `${JIRA_BASE_URL}/browse/${issue?.key || ''}` : null,
            };
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to fetch project issues: ${errorMessage}`);
    }
};

/**
 * Fetch detailed information for a single Jira issue.
 * @param {string} issueKey - The Jira issue key (e.g. "KBAS-123").
 * @returns {Promise<Object>} Normalized issue detail object.
 * @throws {Error} If issueKey is invalid or the API call fails.
 */
export const fetchIssueDetails = async (issueKey) => {
    if (!issueKey || typeof issueKey !== 'string') {
        throw new Error('Issue key is required and must be a string');
    }

    try {
        const issue = await jiraGateway.getIssueDetails(issueKey);

        const fields = issue?.fields || {};
        return {
            id: issue?.key || 'unknown',
            title: fields?.summary || 'Untitled',
            description: fields?.description || '',
            status: fields?.status?.name || 'Unknown',
            assignee: fields?.assignee?.displayName || 'Unassigned',
            created: fields?.created || null,
            updated: fields?.updated || null,
            url: JIRA_BASE_URL ? `${JIRA_BASE_URL}/browse/${issue?.key || ''}` : null,
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to fetch issue details: ${errorMessage}`);
    }
};
