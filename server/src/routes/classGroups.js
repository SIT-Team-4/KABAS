/**
 * @module routes/classGroups
 * @description Class group CRUD routes (admin-only, requires auth).
 */
import express from 'express';
import auth from '../middleware/auth.js';
import * as classGroupController from '../controllers/classGroupController.js';

const router = express.Router();

router.post('/', auth, classGroupController.create);
router.get('/', auth, classGroupController.getAll);
router.get('/:id', auth, classGroupController.getById);
router.put('/:id', auth, classGroupController.update);
router.delete('/:id', auth, classGroupController.remove);

export default router;
