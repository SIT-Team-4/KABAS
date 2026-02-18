import * as jiraConfigGateway from '../gateways/jiraConfigGateway.js';

/**
 * Get current Jira configuration (without sensitive data)
 */
export const getConfig = async (req, res, next) => {
    try {
        const config = jiraConfigGateway.getConfig();
        return res.json({ success: true, data: config });
    } catch (error) {
        return next(error);
    }
};

/**
 * Set Jira configuration from user input
 */
export const setConfig = async (req, res, next) => {
    try {
        const { baseUrl, email, apiToken } = req?.body || {};

        if (!baseUrl || !email || !apiToken) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: baseUrl, email, apiToken',
            });
        }

        jiraConfigGateway.setConfig({ baseUrl, email, apiToken });
        return res.json({ success: true, message: 'Jira configuration updated' });
    } catch (error) {
        return next(error);
    }
};

/**
 * Validate Jira configuration by testing connection
 */
export const validateConfig = async (req, res, next) => {
    try {
        await jiraConfigGateway.validateConfig();
        return res.json({ success: true, message: 'Jira configuration is valid' });
    } catch (error) {
        return next(error);
    }
};

/**
 * Clear Jira configuration
 */
export const clearConfig = async (req, res, next) => {
    try {
        jiraConfigGateway.clearConfig();
        return res.json({ success: true, message: 'Jira configuration cleared' });
    } catch (error) {
        return next(error);
    }
};
