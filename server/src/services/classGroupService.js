import { ClassGroup, Team } from '../models/index.js';

/**
 * Create a new class group.
 * @param {Object} data - Class group attributes (name, startDate, endDate).
 * @returns {Promise<Object>} The created class group.
 */
export async function createClassGroup(data) {
    return ClassGroup.create(data);
}

/**
 * Get all class groups with optional pagination.
 * @param {Object} [options] - Optional pagination parameters.
 * @param {number} [options.limit] - Maximum number of results.
 * @param {number} [options.offset] - Number of results to skip.
 * @returns {Promise<Array<Object>>} Array of class groups ordered by createdAt DESC.
 */
export async function getAllClassGroups({ limit, offset } = {}) {
    const options = { order: [['createdAt', 'DESC']] };
    if (limit != null) options.limit = limit;
    if (offset != null) options.offset = offset;
    return ClassGroup.findAll(options);
}

/**
 * Get a class group by ID, including its associated teams.
 * @param {number|string} id - The class group ID.
 * @returns {Promise<Object>} The class group with teams.
 * @throws {Error} 404 if the class group is not found.
 */
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

/**
 * Update a class group by ID.
 * @param {number|string} id - The class group ID.
 * @param {Object} data - Fields to update.
 * @returns {Promise<Object>} The updated class group.
 * @throws {Error} 404 if the class group is not found.
 */
export async function updateClassGroup(id, data) {
    const classGroup = await ClassGroup.findByPk(id);
    if (!classGroup) {
        const error = new Error('Class group not found');
        error.status = 404;
        throw error;
    }
    return classGroup.update(data);
}

/**
 * Delete a class group by ID.
 * @param {number|string} id - The class group ID.
 * @throws {Error} 404 if the class group is not found.
 */
export async function deleteClassGroup(id) {
    const classGroup = await ClassGroup.findByPk(id);
    if (!classGroup) {
        const error = new Error('Class group not found');
        error.status = 404;
        throw error;
    }
    await classGroup.destroy();
}
