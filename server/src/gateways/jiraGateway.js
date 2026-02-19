import * as jiraConfigGateway from './jiraConfigGateway.js';

export const getPullRequests = async (projectKey) => {
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
            const params = { jql, fields };
            if (nextPageToken) params.nextPageToken = nextPageToken;

            // The search API uses token-based pagination and requires sequential
            // requests; awaiting inside the loop is intentional here.
            // eslint-disable-next-line no-await-in-loop
            const response = await jiraClient.get('/rest/api/3/search/jql', { params });
            const pageIssues = response.data?.results || response.data?.issues || [];
            allIssues = allIssues.concat(pageIssues);
            nextPageToken = response.data?.nextPageToken;
        } while (nextPageToken);

        return allIssues;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Jira API error: ${errorMessage}`);
    }
};

export const getIssueDetails = async (issueKey) => {
    if (!issueKey || typeof issueKey !== 'string') {
        throw new Error('Invalid issue key');
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
