import express from 'express';
import githubRoutes from './github.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the KABAS API' });
});

router.use('/github', githubRoutes);

export default router;
