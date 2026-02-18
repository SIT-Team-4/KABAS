import * as jiraConfigGateway from './jiraConfigGateway.js';

export const getPullRequests = async (projectKey) => {
    if (!projectKey || typeof projectKey !== 'string') {
        throw new Error('Invalid project key');
    }

    try {
        const jiraClient = jiraConfigGateway.getJiraClient();
        const response = await jiraClient.get('/rest/api/3/search', {
            params: {
                jql: `project = ${projectKey} AND type in (Task, Story, Bug)`,
                fields: ['key', 'summary', 'status', 'assignee', 'created', 'updated'],
                maxResults: 50,
            },
        });
        return response.data?.issues || [];
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
        const response = await jiraClient.get(`/rest/api/3/issues/${issueKey}`);
        return response.data || {};
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new Error(`Failed to fetch issue ${issueKey}: ${errorMessage}`);
    }
};
