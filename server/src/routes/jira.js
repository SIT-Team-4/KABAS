import express from 'express';
import * as jiraController from '../controllers/jiraController.js';
import * as jiraConfigController from '../controllers/jiraConfigController.js';

const router = express.Router();

// Configuration endpoints
router.get('/config', jiraConfigController.getConfig);
router.post('/config', jiraConfigController.setConfig);
router.post('/config/validate', jiraConfigController.validateConfig);
router.delete('/config', jiraConfigController.clearConfig);

// Issues endpoints
router.get('/projects/:projectKey/issues', jiraController.getProjectIssues);
router.get('/issues/:issueKey', jiraController.getIssueDetails);

export default router;
