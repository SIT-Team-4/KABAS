import { UniqueConstraintError } from 'sequelize';
import { Team, TeamCredential } from '../models/index.js';

/**
 * Strip the raw apiToken from a credential and replace with a boolean flag.
 * @param {Object} credential - Sequelize credential instance.
 * @returns {Object} Sanitized credential with hasApiToken instead of apiToken.
 */
function sanitizeCredential(credential) {
    const json = credential.toJSON();
    const { apiToken, ...rest } = json;
    return { ...rest, hasApiToken: !!apiToken };
}

/**
 * Create a credential for a team. Throws 409 if one already exists.
 * @param {number|string} teamId - The team ID.
 * @param {Object} data - Credential fields (provider, baseUrl, email, apiToken).
 * @returns {Promise<Object>} The sanitized credential.
 * @throws {Error} 404 if team not found, 409 if credential already exists.
 */
export async function createCredential(teamId, data) {
    const team = await Team.findByPk(teamId);
    if (!team) {
        const error = new Error('Team not found');
        error.status = 404;
        throw error;
    }

    try {
        const credential = await TeamCredential.create({ ...data, teamId });
        return sanitizeCredential(credential);
    } catch (err) {
        if (err instanceof UniqueConstraintError) {
            const error = new Error('Credential already exists for this team');
            error.status = 409;
            throw error;
        }
        throw err;
    }
}

/**
 * Get the credential for a team (sanitized).
 * @param {number|string} teamId - The team ID.
 * @returns {Promise<Object>} The sanitized credential.
 * @throws {Error} 404 if team or credential not found.
 */
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

/**
 * Update the credential for a team.
 * @param {number|string} teamId - The team ID.
 * @param {Object} data - Fields to update.
 * @returns {Promise<Object>} The sanitized updated credential.
 * @throws {Error} 404 if team or credential not found.
 */
export async function updateCredential(teamId, data) {
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

    await credential.update(data);
    return sanitizeCredential(credential);
}

/**
 * Delete the credential for a team.
 * @param {number|string} teamId - The team ID.
 * @throws {Error} 404 if team or credential not found.
 */
export async function deleteCredential(teamId) {
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

    await credential.destroy();
}
