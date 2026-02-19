import express from 'express';
import githubRoutes from './github.js';
import jiraRouter from './jira.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the KABAS API' });
});

router.use('/github', githubRoutes);
router.use('/jira', jiraRouter);

export const configureRoutes = (app) => {
    app.use('/api', router);
};

export default router;
