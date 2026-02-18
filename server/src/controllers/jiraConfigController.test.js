import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as jiraConfigController from './jiraConfigController.js';
import * as jiraConfigGateway from '../gateways/jiraConfigGateway.js';

vi.mock('../gateways/jiraConfigGateway.js');

describe('Jira Config Controller', () => {
  const testConfig = {
    baseUrl: 'https://sit-team-hatq35cd.atlassian.net/jira/software/c/projects/KBAS/boards',
    email: '2300417@sit.singaporetech.edu.sg',
    apiToken: 'ATATT3xFfGF0PfqmvE3o0eeN0IjP-LxC22mKxhg9m5Yk1wjnSJYDa-S_NnYkAN-7qOH-kH9F6vNRn2rMOTnN_-uA1blQj9KvRh8LNghH-0kqg0waKEV5BH5Wfm667uifDMMGcjzT6wRdafYtZpUR4WMCZ_a4qXvvTNeT9v6CvVC2_06zTSHhnMA=6917A448',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getConfig', () => {
    it('should return current configuration without sensitive data', async () => {
      const mockConfig = { baseUrl: testConfig.baseUrl };
      vi.mocked(jiraConfigGateway.getConfig).mockReturnValue(mockConfig);

      const req = {};
      const res = { json: vi.fn() };

      await jiraConfigController.getConfig(req, res, vi.fn());

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockConfig,
      });
    });
  });

  describe('setConfig', () => {
    it('should set configuration with provided test credentials', async () => {
      const req = { body: testConfig };
      const res = { json: vi.fn() };

      await jiraConfigController.setConfig(req, res, vi.fn());

      expect(jiraConfigGateway.setConfig).toHaveBeenCalledWith(testConfig);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Jira configuration updated',
      });
    });

    it('should set configuration with email 2300417@sit.singaporetech.edu.sg', async () => {
      const req = { body: testConfig };
      const res = { json: vi.fn() };

      await jiraConfigController.setConfig(req, res, vi.fn());

      const callArg = vi.mocked(jiraConfigGateway.setConfig).mock.calls[0][0];
      expect(callArg.email).toBe('2300417@sit.singaporetech.edu.sg');
    });

    it('should call next with error on validation failure', async () => {
      vi.mocked(jiraConfigGateway.setConfig).mockImplementation(() => {
        throw new Error('Invalid configuration');
      });

      const req = { body: { baseUrl: 'https://example.atlassian.net', email: 'a@b.com', apiToken: 'tok' } };
      const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
      const next = vi.fn();

      await jiraConfigController.setConfig(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateConfig', () => {
    it('should validate configuration', async () => {
      vi.mocked(jiraConfigGateway.validateConfig).mockResolvedValue(true);

      const req = {};
      const res = { json: vi.fn() };

      await jiraConfigController.validateConfig(req, res, vi.fn());

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Jira configuration is valid',
      });
    });

    it('should handle validation errors', async () => {
      vi.mocked(jiraConfigGateway.validateConfig).mockRejectedValue(
        new Error('Jira connection failed')
      );

      const req = {};
      const res = { json: vi.fn() };
      const next = vi.fn();

      await jiraConfigController.validateConfig(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('clearConfig', () => {
    it('should clear configuration', async () => {
      const req = {};
      const res = { json: vi.fn() };

      await jiraConfigController.clearConfig(req, res, vi.fn());

      expect(jiraConfigGateway.clearConfig).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Jira configuration cleared',
      });
    });
  });
});