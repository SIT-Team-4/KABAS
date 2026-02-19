import { describe, it, expect, vi } from 'vitest';
import * as jiraController from './jiraController.js';
import * as jiraService from '../services/jiraService.js';

vi.mock('../services/jiraService.js');

describe('Jira Controller', () => {
  describe('getProjectIssues', () => {
    it('should return project issues', async () => {
      const mockIssues = [{ id: 'PROJ-1', title: 'Test Issue' }];
      vi.mocked(jiraService.fetchProjectIssues).mockResolvedValue(mockIssues);

      const req = { params: { projectKey: 'PROJ' } };
      const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

      await jiraController.getProjectIssues(req, res, vi.fn());

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockIssues,
      });
    });

    it('should call next with error on failure', async () => {
      const error = new Error('Service error');
      vi.mocked(jiraService.fetchProjectIssues).mockRejectedValue(error);

      const req = { params: { projectKey: 'PROJ' } };
      const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
      const next = vi.fn();

      await jiraController.getProjectIssues(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getIssueDetails', () => {
    it('should return issue details', async () => {
      const mockIssue = { id: 'PROJ-1', title: 'Test Issue', description: 'Details' };
      vi.mocked(jiraService.fetchIssueDetails).mockResolvedValue(mockIssue);

      const req = { params: { issueKey: 'PROJ-1' } };
      const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

      await jiraController.getIssueDetails(req, res, vi.fn());

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockIssue,
      });
    });

    it('should call next with error when service fails', async () => {
      const error = new Error('Service failure');
      vi.mocked(jiraService.fetchIssueDetails).mockRejectedValue(error);

      const req = { params: { issueKey: 'PROJ-1' } };
      const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
      const next = vi.fn();

      await jiraController.getIssueDetails(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});