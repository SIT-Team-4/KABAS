import { Team, ClassGroup } from '../models/index.js';

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

export async function deleteTeam(teamId) {
    const team = await Team.findByPk(teamId);
    if (!team) {
        const error = new Error('Team not found');
        error.status = 404;
        throw error;
    }
    await team.destroy();
}
