import {
    createClassGroupSchema,
    updateClassGroupSchema,
} from '../validation/classGroupSchema.js';
import * as classGroupService from '../services/classGroupService.js';

/**
 * Create a new class group.
 * @param {import('express').Request} req - Express request with class group data in body.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next middleware.
 */
export async function create(req, res, next) {
    try {
        const data = await createClassGroupSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        const classGroup = await classGroupService.createClassGroup(data);
        return res.status(201).json({ success: true, data: classGroup });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res
                .status(400)
                .json({ success: false, error: err.errors.join(', ') });
        }
        return next(err);
    }
}

/**
 * Get all class groups.
 * @param {import('express').Request} req - Express request.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next middleware.
 */
export async function getAll(req, res, next) {
    try {
        const classGroups = await classGroupService.getAllClassGroups();
        res.json({ success: true, data: classGroups });
    } catch (err) {
        next(err);
    }
}

/**
 * Get a single class group by ID, including its teams.
 * @param {import('express').Request} req - Express request with id param.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next middleware.
 */
export async function getById(req, res, next) {
    try {
        const classGroup = await classGroupService.getClassGroupById(
            req.params.id,
        );
        res.json({ success: true, data: classGroup });
    } catch (err) {
        next(err);
    }
}

/**
 * Update an existing class group.
 * @param {import('express').Request} req - Express request with id param and update data in body.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next middleware.
 */
export async function update(req, res, next) {
    try {
        const data = await updateClassGroupSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        const classGroup = await classGroupService.updateClassGroup(
            req.params.id,
            data,
        );
        return res.json({ success: true, data: classGroup });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res
                .status(400)
                .json({ success: false, error: err.errors.join(', ') });
        }
        return next(err);
    }
}

/**
 * Delete a class group by ID.
 * @param {import('express').Request} req - Express request with id param.
 * @param {import('express').Response} res - Express response.
 * @param {import('express').NextFunction} next - Express next middleware.
 */
export async function remove(req, res, next) {
    try {
        await classGroupService.deleteClassGroup(req.params.id);
        res.json({ success: true, message: 'Class group deleted' });
    } catch (err) {
        next(err);
    }
}
