import axios from 'axios';

let jiraConfig = {
  baseUrl: process.env.JIRA_BASE_URL || null,
  email: process.env.JIRA_EMAIL || null,
  apiToken: process.env.JIRA_API_TOKEN || null,
};

/**
 * Get the current Jira configuration
 * @returns {Object} Current Jira config (without sensitive data)
 */
export const getConfig = () => {
  return {
    baseUrl: jiraConfig.baseUrl || null,
    // Email and API token are not returned to frontend for security
  };
};

/**
 * Set Jira configuration from user input
 * @param {Object} config - { baseUrl, email, apiToken }
 * @throws {Error} If configuration is invalid
 */
export const setConfig = (config) => {
  if (!config || typeof config !== 'object') {
    throw new Error('Configuration must be an object');
  }

  let { baseUrl, email, apiToken } = config;

  // Trim whitespace first
  if (typeof baseUrl === 'string') {
    baseUrl = baseUrl.trim();
  }
  if (typeof email === 'string') {
    email = email.trim();
  }
  if (typeof apiToken === 'string') {
    apiToken = apiToken.trim();
  }

  // Then validate
  if (!baseUrl || !email || !apiToken) {
    throw new Error('Missing required Jira configuration: baseUrl, email, and apiToken');
  }

  if (typeof baseUrl !== 'string' || !baseUrl.startsWith('https://')) {
    throw new Error('Jira base URL must start with https://');
  }

  if (typeof email !== 'string' || !email.includes('@')) {
    throw new Error('Invalid email format');
  }

  if (typeof apiToken !== 'string' || apiToken.length === 0) {
    throw new Error('Invalid API token');
  }

  jiraConfig = {
    baseUrl,
    email,
    apiToken,
  };
};

/**
 * Create an authenticated Jira API client with current config
 * @returns {AxiosInstance} Configured axios client
 * @throws {Error} If configuration is incomplete
 */
export const getJiraClient = () => {
  if (!jiraConfig.baseUrl || !jiraConfig.email || !jiraConfig.apiToken) {
    throw new Error('Jira configuration not set. Please configure Jira credentials first.');
  }

  return axios.create({
    baseURL: jiraConfig.baseUrl,
    auth: {
      username: jiraConfig.email,
      password: jiraConfig.apiToken,
    },
  });
};

/**
 * Validate Jira configuration by testing the connection
 * @returns {Promise<boolean>} True if connection successful
 * @throws {Error} If validation fails
 */
export const validateConfig = async () => {
  if (!jiraConfig.baseUrl || !jiraConfig.email || !jiraConfig.apiToken) {
    throw new Error('Jira configuration not set');
  }

  try {
    const client = getJiraClient();
    await client.get('/rest/api/3/myself');
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Jira connection failed: ${errorMessage}`);
  }
};

/**
 * Clear Jira configuration
 */
export const clearConfig = () => {
  jiraConfig = {
    baseUrl: null,
    email: null,
    apiToken: null,
  };
};