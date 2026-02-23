import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UniqueConstraintError } from 'sequelize';
import * as teamCredentialService from './teamCredentialService.js';
import { Team, TeamCredential } from '../models/index.js';

vi.mock('../models/index.js', () => ({
    Team: {
        findByPk: vi.fn(),
    },
    TeamCredential: {
        findOne: vi.fn(),
        create: vi.fn(),
    },
}));

function createMockCredential(overrides = {}) {
    const data = {
        id: 1,
        teamId: 1,
        provider: 'jira',
        baseUrl: 'https://example.atlassian.net',
        email: 'test@example.com',
        apiToken: 'decrypted-token',
        ...overrides,
    };
    return {
        ...data,
        toJSON: vi.fn().mockReturnValue({ ...data }),
        update: vi.fn(),
        destroy: vi.fn(),
    };
}

describe('teamCredentialService', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    const credentialData = {
        provider: 'jira',
        baseUrl: 'https://example.atlassian.net',
        email: 'test@example.com',
        apiToken: 'my-secret-token',
    };

    describe('createCredential', () => {
        it('should create a credential for an existing team', async () => {
            const mock = createMockCredential();
            vi.mocked(Team.findByPk).mockResolvedValue({ id: 1 });
            vi.mocked(TeamCredential.create).mockResolvedValue(mock);

            const result = await teamCredentialService.createCredential(
                1,
                credentialData,
            );

            expect(Team.findByPk).toHaveBeenCalledWith(1);
            expect(TeamCredential.create).toHaveBeenCalledWith({
                ...credentialData,
                teamId: 1,
            });
            expect(result).not.toHaveProperty('apiToken');
            expect(result.hasApiToken).toBe(true);
        });

        it('should throw 404 if team not found', async () => {
            vi.mocked(Team.findByPk).mockResolvedValue(null);

            const error = await teamCredentialService
                .createCredential(999, credentialData)
                .catch((e) => e);
            expect(error.message).toBe('Team not found');
            expect(error.status).toBe(404);
        });

        it('should throw 409 if credential already exists (UniqueConstraintError)', async () => {
            vi.mocked(Team.findByPk).mockResolvedValue({ id: 1 });
            vi.mocked(TeamCredential.create).mockRejectedValue(
                new UniqueConstraintError({}),
            );

            const error = await teamCredentialService
                .createCredential(1, credentialData)
                .catch((e) => e);
            expect(error.message).toBe(
                'Credential already exists for this team',
            );
            expect(error.status).toBe(409);
        });

        it('should rethrow non-unique-constraint errors', async () => {
            vi.mocked(Team.findByPk).mockResolvedValue({ id: 1 });
            vi.mocked(TeamCredential.create).mockRejectedValue(
                new Error('DB connection failed'),
            );

            await expect(
                teamCredentialService.createCredential(1, credentialData),
            ).rejects.toThrow('DB connection failed');
        });
    });

    describe('getCredential', () => {
        it('should return credential without apiToken', async () => {
            const mock = createMockCredential();
            vi.mocked(Team.findByPk).mockResolvedValue({ id: 1 });
            vi.mocked(TeamCredential.findOne).mockResolvedValue(mock);

            const result =
                await teamCredentialService.getCredential(1);

            expect(result).not.toHaveProperty('apiToken');
            expect(result.hasApiToken).toBe(true);
            expect(result.provider).toBe('jira');
            expect(result.baseUrl).toBe('https://example.atlassian.net');
        });

        it('should return hasApiToken false when apiToken is null', async () => {
            const mock = createMockCredential({ apiToken: null });
            vi.mocked(Team.findByPk).mockResolvedValue({ id: 1 });
            vi.mocked(TeamCredential.findOne).mockResolvedValue(mock);

            const result =
                await teamCredentialService.getCredential(1);

            expect(result.hasApiToken).toBe(false);
        });

        it('should throw 404 if team not found', async () => {
            vi.mocked(Team.findByPk).mockResolvedValue(null);

            const error = await teamCredentialService
                .getCredential(999)
                .catch((e) => e);
            expect(error.message).toBe('Team not found');
            expect(error.status).toBe(404);
        });

        it('should throw 404 if credential not found', async () => {
            vi.mocked(Team.findByPk).mockResolvedValue({ id: 1 });
            vi.mocked(TeamCredential.findOne).mockResolvedValue(null);

            const error = await teamCredentialService
                .getCredential(1)
                .catch((e) => e);
            expect(error.message).toBe('Credential not found');
            expect(error.status).toBe(404);
        });
    });

    describe('updateCredential', () => {
        it('should update and return credential without apiToken', async () => {
            const mock = createMockCredential();
            mock.update.mockResolvedValue(mock);
            vi.mocked(Team.findByPk).mockResolvedValue({ id: 1 });
            vi.mocked(TeamCredential.findOne).mockResolvedValue(mock);

            const result = await teamCredentialService.updateCredential(1, {
                apiToken: 'new-token',
            });

            expect(mock.update).toHaveBeenCalledWith({
                apiToken: 'new-token',
            });
            expect(result).not.toHaveProperty('apiToken');
            expect(result.hasApiToken).toBe(true);
        });

        it('should throw 404 if team not found', async () => {
            vi.mocked(Team.findByPk).mockResolvedValue(null);

            const error = await teamCredentialService
                .updateCredential(999, { apiToken: 'x' })
                .catch((e) => e);
            expect(error.message).toBe('Team not found');
            expect(error.status).toBe(404);
        });

        it('should throw 404 if credential not found', async () => {
            vi.mocked(Team.findByPk).mockResolvedValue({ id: 1 });
            vi.mocked(TeamCredential.findOne).mockResolvedValue(null);

            const error = await teamCredentialService
                .updateCredential(1, { apiToken: 'x' })
                .catch((e) => e);
            expect(error.message).toBe('Credential not found');
            expect(error.status).toBe(404);
        });
    });

    describe('deleteCredential', () => {
        it('should delete the credential', async () => {
            const mock = createMockCredential();
            vi.mocked(Team.findByPk).mockResolvedValue({ id: 1 });
            vi.mocked(TeamCredential.findOne).mockResolvedValue(mock);

            await teamCredentialService.deleteCredential(1);

            expect(mock.destroy).toHaveBeenCalled();
        });

        it('should throw 404 if team not found', async () => {
            vi.mocked(Team.findByPk).mockResolvedValue(null);

            const error = await teamCredentialService
                .deleteCredential(999)
                .catch((e) => e);
            expect(error.message).toBe('Team not found');
            expect(error.status).toBe(404);
        });

        it('should throw 404 if credential not found', async () => {
            vi.mocked(Team.findByPk).mockResolvedValue({ id: 1 });
            vi.mocked(TeamCredential.findOne).mockResolvedValue(null);

            const error = await teamCredentialService
                .deleteCredential(1)
                .catch((e) => e);
            expect(error.message).toBe('Credential not found');
            expect(error.status).toBe(404);
        });
    });
});
