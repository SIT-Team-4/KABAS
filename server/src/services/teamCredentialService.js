import { Team, TeamCredential } from '../models/index.js';

function sanitizeCredential(credential) {
    const json = credential.toJSON();
    const { apiToken, ...rest } = json;
    return { ...rest, hasApiToken: !!apiToken };
}

export async function createCredential(teamId, data) {
    const team = await Team.findByPk(teamId);
    if (!team) {
        const error = new Error('Team not found');
        error.status = 404;
        throw error;
    }

    const existing = await TeamCredential.findOne({ where: { teamId } });
    if (existing) {
        const error = new Error('Credential already exists for this team');
        error.status = 409;
        throw error;
    }

    const credential = await TeamCredential.create({ ...data, teamId });
    return sanitizeCredential(credential);
}

export async function getCredential(teamId) {
    const team = await Team.findByPk(teamId);
    if (!team) {
        const error = new Error('Team not found');
        error.status = 404;
        throw error;
    }

    const credential = await TeamCredential.findOne({ where: { teamId } });
    if (!credential) {
        const error = new Error('Credential not found');
        error.status = 404;
        throw error;
    }

    return sanitizeCredential(credential);
}

export async function updateCredential(teamId, data) {
    const credential = await TeamCredential.findOne({ where: { teamId } });
    if (!credential) {
        const error = new Error('Credential not found');
        error.status = 404;
        throw error;
    }

    await credential.update(data);
    return sanitizeCredential(credential);
}

export async function deleteCredential(teamId) {
    const credential = await TeamCredential.findOne({ where: { teamId } });
    if (!credential) {
        const error = new Error('Credential not found');
        error.status = 404;
        throw error;
    }

    await credential.destroy();
}
