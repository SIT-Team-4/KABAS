import * as jiraConfigGateway from './jiraConfigGateway.js';

/**
 * Fetch all issues for a Jira project using JQL search with token-based pagination.
 * @param {string} projectKey - The Jira project key (e.g. "KBAS").
 * @returns {Promise<Array<Object>>} Array of raw Jira issue objects.
 * @throws {Error} If the project key is invalid or the API call fails.
 */
export const getIssues = async (projectKey) => {
    if (!projectKey || typeof projectKey !== 'string') {
        throw new Error('Invalid project key');
    }

    // allowlist project key to avoid JQL injection
    const safeKey = projectKey.trim();
    if (!/^[A-Z0-9_-]+$/i.test(safeKey)) {
        throw new Error('Invalid project key format');
    }

    try {
        const jiraClient = jiraConfigGateway.getJiraClient();

        const jql = `project = "${safeKey}" AND type in (Task, Story, Bug)`;
        const fields = ['key', 'summary', 'status', 'assignee', 'created', 'updated'];

        let allIssues = [];
        let nextPageToken;

        // Token-based pagination loop for enhanced JQL search
        do {
            const body = { jql, fields };
            if (nextPageToken) body.nextPageToken = nextPageToken;

            // The search API uses token-based pagination and requires sequential
            // requests; awaiting inside the loop is intentional here.
            // eslint-disable-next-line no-await-in-loop
            const response = await jiraClient.post('/rest/api/3/search/jql', body);
            const pageIssues = response.data?.issues || [];
            allIssues = allIssues.concat(pageIssues);
            nextPageToken = response.data?.nextPageToken;
        } while (nextPageToken);

        return allIssues;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Jira API error: ${errorMessage}`);
    }
};

/**
 * Fetch detailed information for a single Jira issue by key.
 * @param {string} issueKey - The Jira issue key (e.g. "KBAS-123").
 * @returns {Promise<Object>} Raw Jira issue data.
 * @throws {Error} If the issue key is invalid or the API call fails.
 */
export const getIssueDetails = async (issueKey) => {
    if (!issueKey || typeof issueKey !== 'string') {
        throw new Error('Invalid issue key');
    }

    // Validate issueKey format to prevent path traversal (e.g., PROJ-123)
    if (!/^[A-Z][A-Z0-9]+-\d+$/i.test(issueKey.trim())) {
        throw new Error('Invalid issue key format');
    }

    try {
        const jiraClient = jiraConfigGateway.getJiraClient();
        const response = await jiraClient.get(`/rest/api/3/issue/${issueKey}`);
        return response.data || {};
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to fetch issue ${issueKey}: ${errorMessage}`);
    }
};
