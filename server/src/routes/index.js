import express from 'express';
import githubRoutes from './github.js';
import jiraRouter from './jira.js';
import classGroupRoutes from './classGroups.js';
import teamRoutes from './teams.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the KABAS API' });
});

router.use('/github', githubRoutes);
router.use('/jira', jiraRouter);
router.use('/class-groups', classGroupRoutes);
router.use('/teams', teamRoutes);

export default router;
