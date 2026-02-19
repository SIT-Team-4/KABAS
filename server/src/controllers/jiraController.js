import * as jiraService from '../services/jiraService.js';

export const getProjectIssues = async (req, res, next) => {
    try {
        const { projectKey } = req?.params || {};

        if (!projectKey) {
            return res.status(400).json({
                success: false,
                error: 'Project key is required',
            });
        }

        const issues = await jiraService.fetchProjectIssues(projectKey);
        return res.json({ success: true, data: issues });
    } catch (error) {
        return next(error);
    }
};

export const getIssueDetails = async (req, res, next) => {
    try {
        const { issueKey } = req?.params || {};

        if (!issueKey) {
            return res.status(400).json({
                success: false,
                error: 'Issue key is required',
            });
        }

        const issue = await jiraService.fetchIssueDetails(issueKey);
        return res.json({ success: true, data: issue });
    } catch (error) {
        return next(error);
    }
};
