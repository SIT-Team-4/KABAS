import express from 'express';
import auth from '../middleware/auth.js';
import * as analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/teams', auth, analyticsController.getAllTeamsAnalytics);

export default router;
