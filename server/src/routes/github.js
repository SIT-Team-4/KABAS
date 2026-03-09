/**
 * @module routes/github
 * @description GitHub API routes for Kanban board data.
 */
import express from 'express';
import { getKanbanData } from '../controllers/githubController.js';

const router = express.Router();

router.get('/:owner/:repo/kanban', getKanbanData);

export default router;
