import express from 'express';
import auth from '../middleware/auth.js';
import * as teamController from '../controllers/teamController.js';
import * as teamCredentialController from '../controllers/teamCredentialController.js';

const router = express.Router();

// Team CRUD
router.post('/', auth, teamController.create);
router.get('/', auth, teamController.getAll);
router.get('/:teamId', auth, teamController.getById);
router.put('/:teamId', auth, teamController.update);
router.delete('/:teamId', auth, teamController.remove);

// Team Credential CRUD (nested under team)
router.post('/:teamId/credentials', auth, teamCredentialController.create);
router.get('/:teamId/credentials', auth, teamCredentialController.get);
router.put('/:teamId/credentials', auth, teamCredentialController.update);
router.delete('/:teamId/credentials', auth, teamCredentialController.remove);

export default router;
