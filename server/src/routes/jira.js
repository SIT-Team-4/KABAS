import express from 'express';
import * as jiraController from '../controllers/jiraController.js';
import * as jiraConfigController from '../controllers/jiraConfigController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Configuration endpoints
router.get('/config', jiraConfigController.getConfig);
router.post('/config', auth, jiraConfigController.setConfig);
router.post('/config/validate', auth, jiraConfigController.validateConfig);
router.delete('/config', auth, jiraConfigController.clearConfig);

// Issues endpoints
router.get('/projects/:projectKey/issues', jiraController.getProjectIssues);
router.get('/issues/:issueKey', jiraController.getIssueDetails);

export default router;
