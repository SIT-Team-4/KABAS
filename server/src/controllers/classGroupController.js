import {
    createClassGroupSchema,
    updateClassGroupSchema,
} from '../validation/classGroupSchema.js';
import * as classGroupService from '../services/classGroupService.js';

export async function create(req, res, next) {
    try {
        const data = await createClassGroupSchema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        const classGroup = await classGroupService.createClassGroup(data);
        res.status(201).json({ success: true, data: classGroup });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res
                .status(400)
                .json({ success: false, error: err.errors.join(', ') });
        }
        next(err);
    }
}

export async function getAll(req, res, next) {
    try {
        const classGroups = await classGroupService.getAllClassGroups();
        res.json({ success: true, data: classGroups });
    } catch (err) {
        next(err);
    }
}

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
        res.json({ success: true, data: classGroup });
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res
                .status(400)
                .json({ success: false, error: err.errors.join(', ') });
        }
        next(err);
    }
}

export async function remove(req, res, next) {
    try {
        await classGroupService.deleteClassGroup(req.params.id);
        res.json({ success: true, message: 'Class group deleted' });
    } catch (err) {
        next(err);
    }
}
