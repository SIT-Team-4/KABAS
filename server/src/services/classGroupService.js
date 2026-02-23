import { ClassGroup, Team } from '../models/index.js';

export async function createClassGroup(data) {
    return ClassGroup.create(data);
}

export async function getAllClassGroups({ limit, offset } = {}) {
    const options = { order: [['createdAt', 'DESC']] };
    if (limit != null) options.limit = limit;
    if (offset != null) options.offset = offset;
    return ClassGroup.findAll(options);
}

export async function getClassGroupById(id) {
    const classGroup = await ClassGroup.findByPk(id, {
        include: [{ model: Team, attributes: ['id', 'name'] }],
    });
    if (!classGroup) {
        const error = new Error('Class group not found');
        error.status = 404;
        throw error;
    }
    return classGroup;
}

export async function updateClassGroup(id, data) {
    const classGroup = await ClassGroup.findByPk(id);
    if (!classGroup) {
        const error = new Error('Class group not found');
        error.status = 404;
        throw error;
    }
    return classGroup.update(data);
}

export async function deleteClassGroup(id) {
    const classGroup = await ClassGroup.findByPk(id);
    if (!classGroup) {
        const error = new Error('Class group not found');
        error.status = 404;
        throw error;
    }
    await classGroup.destroy();
}
