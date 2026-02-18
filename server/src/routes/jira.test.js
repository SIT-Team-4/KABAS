import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import request from 'supertest';
import jiraRouter from './jira.js';
import * as jiraController from '../controllers/jiraController.js';

vi.mock('../controllers/jiraController.js');

describe('Jira Routes', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(jiraRouter);
  });

  it('should route GET /projects/:projectKey/issues to getProjectIssues', async () => {
    vi.mocked(jiraController.getProjectIssues).mockImplementation((req, res) => {
      res.json({ success: true, data: [] });
    });

    const response = await request(app).get('/projects/PROJ/issues');
    expect(response.status).toBe(200);
    expect(jiraController.getProjectIssues).toHaveBeenCalled();
  });

  it('should route GET /issues/:issueKey to getIssueDetails', async () => {
    vi.mocked(jiraController.getIssueDetails).mockImplementation((req, res) => {
      res.json({ success: true, data: {} });
    });

    const response = await request(app).get('/issues/PROJ-1');
    expect(response.status).toBe(200);
    expect(jiraController.getIssueDetails).toHaveBeenCalled();
  });
});