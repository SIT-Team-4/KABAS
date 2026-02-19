import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as jiraGateway from './jiraGateway.js';
import * as jiraConfigGateway from './jiraConfigGateway.js';
vi.mock('./jiraConfigGateway.js');

describe('Jira Gateway', () => {
  const testConfig = {
    baseUrl: 'https://example.atlassian.net',
    email: 'test-email@university.edu',
    apiToken: 'fake-token',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getPullRequests', () => {
    it('should fetch issues from a Jira project with provided credentials', async () => {
      const mockIssues = [
        {
          key: 'PROJ-1',
          summary: 'Test Issue',
          status: { name: 'To Do' },
          assignee: { displayName: 'John' },
          created: '2026-02-18',
          updated: '2026-02-18',
        },
      ];

      const mockClient = {
        get: vi.fn().mockResolvedValue({ data: { issues: mockIssues } }),
      };

      vi.mocked(jiraConfigGateway.getJiraClient).mockReturnValue(mockClient);

      const result = await jiraGateway.getPullRequests('PROJ');

      expect(result).toEqual(mockIssues);
      expect(mockClient.get).toHaveBeenCalledWith(
        '/rest/api/3/search/jql',
        expect.objectContaining({
          params: expect.objectContaining({
            jql: 'project = "PROJ" AND type in (Task, Story, Bug)',
          }),
        })
      );
    });

    it('should return empty array when no issues found', async () => {
      const mockClient = {
        get: vi.fn().mockResolvedValue({ data: { issues: null } }),
      };

      vi.mocked(jiraConfigGateway.getJiraClient).mockReturnValue(mockClient);

      const result = await jiraGateway.getPullRequests('PROJ');
      
      expect(result).toEqual([]);
    });

    it('should throw error when configuration not set', async () => {
      vi.mocked(jiraConfigGateway.getJiraClient).mockImplementation(() => {
        throw new Error('Jira configuration not set. Please configure Jira credentials first.');
      });

      await expect(jiraGateway.getPullRequests('PROJ')).rejects.toThrow('Jira API error');
    });

    it('should throw error on invalid project key', async () => {
      await expect(jiraGateway.getPullRequests('')).rejects.toThrow('Invalid project key');
    });

    it('should throw error on null project key', async () => {
      await expect(jiraGateway.getPullRequests(null)).rejects.toThrow('Invalid project key');
    });

    it('should throw error on API failure', async () => {
      const mockClient = {
        get: vi.fn().mockRejectedValue(new Error('Network error')),
      };

      vi.mocked(jiraConfigGateway.getJiraClient).mockReturnValue(mockClient);

      await expect(jiraGateway.getPullRequests('PROJ')).rejects.toThrow('Jira API error');
    });
  });

  describe('getIssueDetails', () => {
    it('should fetch details for a specific issue with provided credentials', async () => {
      const mockIssue = {
        key: 'PROJ-1',
        summary: 'Test Issue',
        description: { plainText: 'Issue details' },
        status: { name: 'In Progress' },
        assignee: { displayName: 'John' },
        created: '2026-02-18',
        updated: '2026-02-18',
      };

      const mockClient = {
        get: vi.fn().mockResolvedValue({ data: mockIssue }),
      };

      vi.mocked(jiraConfigGateway.getJiraClient).mockReturnValue(mockClient);

      const result = await jiraGateway.getIssueDetails('PROJ-1');

      expect(result).toEqual(mockIssue);
      expect(mockClient.get).toHaveBeenCalledWith('/rest/api/3/issue/PROJ-1');
    });

    it('should return empty object when no data returned', async () => {
      const mockClient = {
        get: vi.fn().mockResolvedValue({ data: null }),
      };

      vi.mocked(jiraConfigGateway.getJiraClient).mockReturnValue(mockClient);

      const result = await jiraGateway.getIssueDetails('PROJ-1');
      
      expect(result).toEqual({});
    });

    it('should throw error when configuration not set', async () => {
      vi.mocked(jiraConfigGateway.getJiraClient).mockImplementation(() => {
        throw new Error('Jira configuration not set. Please configure Jira credentials first.');
      });

      await expect(jiraGateway.getIssueDetails('PROJ-1')).rejects.toThrow(
        'Failed to fetch issue PROJ-1'
      );
    });

    it('should throw error on invalid issue key', async () => {
      await expect(jiraGateway.getIssueDetails('')).rejects.toThrow('Invalid issue key');
    });

    it('should throw error on null issue key', async () => {
      await expect(jiraGateway.getIssueDetails(null)).rejects.toThrow('Invalid issue key');
    });

    it('should throw error if issue not found', async () => {
      const mockClient = {
        get: vi.fn().mockRejectedValue(new Error('Issue not found')),
      };

      vi.mocked(jiraConfigGateway.getJiraClient).mockReturnValue(mockClient);

      await expect(jiraGateway.getIssueDetails('PROJ-999')).rejects.toThrow(
        'Failed to fetch issue PROJ-999'
      );
    });
  });
});