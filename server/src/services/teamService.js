import { Team, ClassGroup } from '../models/index.js';

/**
 * Create a new team, validating that the class group exists if provided.
 * @param {Object} data - Team attributes (name, classGroupId).
 * @returns {Promise<Object>} The created team.
 * @throws {Error} 404 if the referenced class group does not exist.
 */
export async function createTeam(data) {
    if (data.classGroupId != null) {
        const classGroup = await ClassGroup.findByPk(data.classGroupId);
        if (!classGroup) {
            const error = new Error('Class group not found');
            error.status = 404;
            throw error;
        }
    }
    return Team.create(data);
}

/**
 * Get all teams, optionally filtered by classGroupId.
 * @param {Object} [query] - Optional query filters.
 * @param {number|string} [query.classGroupId] - Filter by class group.
 * @returns {Promise<Array<Object>>} Array of teams with their class groups.
 */
export async function getAllTeams(query = {}) {
    const where = {};
    if (query.classGroupId) {
        where.classGroupId = query.classGroupId;
    }
    return Team.findAll({
        where,
        include: [{ model: ClassGroup, attributes: ['id', 'name'] }],
        order: [['createdAt', 'DESC']],
    });
}

/**
 * Get a team by ID, including its class group.
 * @param {number|string} teamId - The team ID.
 * @returns {Promise<Object>} The team with its class group.
 * @throws {Error} 404 if the team is not found.
 */
export async function getTeamById(teamId) {
    const team = await Team.findByPk(teamId, {
        include: [{ model: ClassGroup, attributes: ['id', 'name'] }],
    });
    if (!team) {
        const error = new Error('Team not found');
        error.status = 404;
        throw error;
    }
    return team;
}

/**
 * Update a team by ID, validating the class group if changed.
 * @param {number|string} teamId - The team ID.
 * @param {Object} data - Fields to update.
 * @returns {Promise<Object>} The updated team.
 * @throws {Error} 404 if the team or referenced class group is not found.
 */
export async function updateTeam(teamId, data) {
    const team = await Team.findByPk(teamId);
    if (!team) {
        const error = new Error('Team not found');
        error.status = 404;
        throw error;
    }
    if (data.classGroupId != null) {
        const classGroup = await ClassGroup.findByPk(data.classGroupId);
        if (!classGroup) {
            const error = new Error('Class group not found');
            error.status = 404;
            throw error;
        }
    }
    return team.update(data);
}

/**
 * Delete a team by ID.
 * @param {number|string} teamId - The team ID.
 * @throws {Error} 404 if the team is not found.
 */
export async function deleteTeam(teamId) {
    const team = await Team.findByPk(teamId);
    if (!team) {
        const error = new Error('Team not found');
        error.status = 404;
        throw error;
    }
    await team.destroy();
}
