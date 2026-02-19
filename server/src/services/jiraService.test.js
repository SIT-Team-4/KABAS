import { describe, it, expect, vi } from 'vitest';
import * as jiraService from './jiraService.js';
import * as jiraGateway from '../gateways/jiraGateway.js';

vi.mock('../gateways/jiraGateway.js');

describe('Jira Service', () => {
  describe('fetchProjectIssues', () => {
    it('should transform Jira issues into a standard format', async () => {
      const mockIssues = [
        {
          key: 'PROJ-1',
          fields: {
            summary: 'Fix login bug',
            status: { name: 'In Progress' },
            assignee: { displayName: 'Alice' },
            created: '2026-02-18',
            updated: '2026-02-18',
          },
        },
      ];
      vi.mocked(jiraGateway.getPullRequests).mockResolvedValue(mockIssues);

      const result = await jiraService.fetchProjectIssues('PROJ');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(
        expect.objectContaining({
          id: 'PROJ-1',
          title: 'Fix login bug',
          status: 'In Progress',
          assignee: 'Alice',
        })
      );
    });

    it('should throw error if project key is missing', async () => {
      await expect(jiraService.fetchProjectIssues('')).rejects.toThrow('Project key is required');
    });
  });

  describe('fetchIssueDetails', () => {
    it('should transform Jira issue details', async () => {
      const mockIssue = {
        key: 'PROJ-1',
        fields: {
          summary: 'Fix login bug',
          description: 'Users cannot login',
          status: { name: 'In Progress' },
          assignee: { displayName: 'Alice' },
          created: '2026-02-18',
          updated: '2026-02-18',
        },
      };
      vi.mocked(jiraGateway.getIssueDetails).mockResolvedValue(mockIssue);

      const result = await jiraService.fetchIssueDetails('PROJ-1');

      expect(result).toEqual(
        expect.objectContaining({
          id: 'PROJ-1',
          title: 'Fix login bug',
          description: 'Users cannot login',
          status: 'In Progress',
        })
      );
    });

    it('should throw error if issue key is missing', async () => {
      await expect(jiraService.fetchIssueDetails('')).rejects.toThrow('Issue key is required');
    });
  });
});