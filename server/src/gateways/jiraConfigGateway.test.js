import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';
import * as jiraConfigGateway from './jiraConfigGateway.js';

vi.mock('axios');

describe('Jira Config Gateway', () => {
  const testConfig = {
    baseUrl: 'https://sit-team-hatq35cd.atlassian.net/jira/software/c/projects/KBAS/boards',
    email: '2300417@sit.singaporetech.edu.sg',
    apiToken: 'ATATT3xFfGF0PfqmvE3o0eeN0IjP-LxC22mKxhg9m5Yk1wjnSJYDa-S_NnYkAN-7qOH-kH9F6vNRn2rMOTnN_-uA1blQj9KvRh8LNghH-0kqg0waKEV5BH5Wfm667uifDMMGcjzT6wRdafYtZpUR4WMCZ_a4qXvvTNeT9v6CvVC2_06zTSHhnMA=6917A448',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    jiraConfigGateway.clearConfig();
  });

  describe('getConfig', () => {
    it('should return baseUrl without sensitive data', () => {
      jiraConfigGateway.setConfig(testConfig);

      const config = jiraConfigGateway.getConfig();
      expect(config.baseUrl).toBe(testConfig.baseUrl);
      expect(config.email).toBeUndefined();
      expect(config.apiToken).toBeUndefined();
    });

    it('should return null baseUrl if not configured', () => {
      const config = jiraConfigGateway.getConfig();
      expect(config.baseUrl).toBeNull();
    });
  });

  describe('setConfig', () => {
    it('should set valid configuration with provided credentials', () => {
      expect(() => jiraConfigGateway.setConfig(testConfig)).not.toThrow();
      expect(jiraConfigGateway.getConfig().baseUrl).toBe(testConfig.baseUrl);
    });

    it('should throw error if config is not an object', () => {
      expect(() => jiraConfigGateway.setConfig(null)).toThrow('Configuration must be an object');
    });

    it('should throw error if baseUrl is missing', () => {
      expect(() =>
        jiraConfigGateway.setConfig({
          email: testConfig.email,
          apiToken: testConfig.apiToken,
        })
      ).toThrow('Missing required Jira configuration');
    });

    it('should throw error if baseUrl does not start with https://', () => {
      expect(() =>
        jiraConfigGateway.setConfig({
          baseUrl: 'http://sit-team-hatq35cd.atlassian.net/jira/software/c/projects/KBAS/boards',
          email: testConfig.email,
          apiToken: testConfig.apiToken,
        })
      ).toThrow('Jira base URL must start with https://');
    });

    it('should throw error for invalid email format', () => {
      expect(() =>
        jiraConfigGateway.setConfig({
          baseUrl: testConfig.baseUrl,
          email: 'invalid-email',
          apiToken: testConfig.apiToken,
        })
      ).toThrow('Invalid email format');
    });

    it('should throw error for invalid API token', () => {
      expect(() =>
        jiraConfigGateway.setConfig({
          baseUrl: testConfig.baseUrl,
          email: testConfig.email,
          apiToken: '',
        })
      ).toThrow('Missing required Jira configuration');
    });

    it('should trim whitespace from config values', () => {
      const configWithWhitespace = {
        baseUrl: `  ${testConfig.baseUrl}  `,
        email: `  ${testConfig.email}  `,
        apiToken: `  ${testConfig.apiToken}  `,
      };

      jiraConfigGateway.setConfig(configWithWhitespace);

      const config = jiraConfigGateway.getConfig();
      expect(config.baseUrl).toBe(testConfig.baseUrl);
      expect(config.baseUrl).not.toContain('  ');
    });
  });

  describe('getJiraClient', () => {
    it('should create axios client with provided test credentials', () => {
      jiraConfigGateway.setConfig(testConfig);

      jiraConfigGateway.getJiraClient();
      expect(axios.create).toHaveBeenCalledWith({
        baseURL: testConfig.baseUrl,
        auth: {
          username: testConfig.email,
          password: testConfig.apiToken,
        },
      });
    });

    it('should throw error if configuration not set', () => {
      expect(() => jiraConfigGateway.getJiraClient()).toThrow('Jira configuration not set');
    });
  });

  describe('validateConfig', () => {
    it('should validate configuration by testing connection with provided credentials', async () => {
      const mockClient = { get: vi.fn().mockResolvedValue({ data: {} }) };
      vi.mocked(axios.create).mockReturnValue(mockClient);

      jiraConfigGateway.setConfig(testConfig);

      const result = await jiraConfigGateway.validateConfig();
      expect(result).toBe(true);
      expect(mockClient.get).toHaveBeenCalledWith('/rest/api/3/myself');
    });

    it('should throw error if validation fails with invalid credentials', async () => {
      const mockClient = { get: vi.fn().mockRejectedValue(new Error('Unauthorized')) };
      vi.mocked(axios.create).mockReturnValue(mockClient);

      jiraConfigGateway.setConfig(testConfig);

      await expect(jiraConfigGateway.validateConfig()).rejects.toThrow('Jira connection failed');
    });

    it('should throw error if config not set', async () => {
      await expect(jiraConfigGateway.validateConfig()).rejects.toThrow('Jira configuration not set');
    });
  });

  describe('clearConfig', () => {
    it('should clear configuration', () => {
      jiraConfigGateway.setConfig(testConfig);

      jiraConfigGateway.clearConfig();
      const config = jiraConfigGateway.getConfig();
      expect(config.baseUrl).toBeNull();
    });
  });
});