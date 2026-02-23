import { describe, it, expect, vi, beforeEach } from 'vitest';
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

describe('teamCredentialService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockCredential = {
        id: 1,
        teamId: 1,
        provider: 'jira',
        baseUrl: 'https://example.atlassian.net',
        email: 'test@example.com',
        apiToken: 'decrypted-token',
        toJSON: vi.fn().mockReturnValue({
            id: 1,
            teamId: 1,
            provider: 'jira',
            baseUrl: 'https://example.atlassian.net',
            email: 'test@example.com',
            apiToken: 'decrypted-token',
        }),
        update: vi.fn(),
        destroy: vi.fn(),
    };

    const credentialData = {
        provider: 'jira',
        baseUrl: 'https://example.atlassian.net',
        email: 'test@example.com',
        apiToken: 'my-secret-token',
    };

    describe('createCredential', () => {
        it('should create a credential for an existing team', async () => {
            vi.mocked(Team.findByPk).mockResolvedValue({ id: 1 });
            vi.mocked(TeamCredential.findOne).mockResolvedValue(null);
            vi.mocked(TeamCredential.create).mockResolvedValue(mockCredential);

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

            await expect(
                teamCredentialService.createCredential(999, credentialData),
            ).rejects.toThrow('Team not found');
        });

        it('should throw 409 if credential already exists', async () => {
            vi.mocked(Team.findByPk).mockResolvedValue({ id: 1 });
            vi.mocked(TeamCredential.findOne).mockResolvedValue(
                mockCredential,
            );

            await expect(
                teamCredentialService.createCredential(1, credentialData),
            ).rejects.toThrow('Credential already exists for this team');
        });
    });

    describe('getCredential', () => {
        it('should return credential without apiToken', async () => {
            vi.mocked(Team.findByPk).mockResolvedValue({ id: 1 });
            vi.mocked(TeamCredential.findOne).mockResolvedValue(
                mockCredential,
            );

            const result =
                await teamCredentialService.getCredential(1);

            expect(result).not.toHaveProperty('apiToken');
            expect(result.hasApiToken).toBe(true);
            expect(result.provider).toBe('jira');
            expect(result.baseUrl).toBe('https://example.atlassian.net');
        });

        it('should return hasApiToken false when apiToken is null', async () => {
            const credNoToken = {
                ...mockCredential,
                toJSON: vi.fn().mockReturnValue({
                    id: 1,
                    teamId: 1,
                    provider: 'jira',
                    baseUrl: 'https://example.atlassian.net',
                    email: 'test@example.com',
                    apiToken: null,
                }),
            };
            vi.mocked(Team.findByPk).mockResolvedValue({ id: 1 });
            vi.mocked(TeamCredential.findOne).mockResolvedValue(credNoToken);

            const result =
                await teamCredentialService.getCredential(1);

            expect(result.hasApiToken).toBe(false);
        });

        it('should throw 404 if team not found', async () => {
            vi.mocked(Team.findByPk).mockResolvedValue(null);

            await expect(
                teamCredentialService.getCredential(999),
            ).rejects.toThrow('Team not found');
        });

        it('should throw 404 if credential not found', async () => {
            vi.mocked(Team.findByPk).mockResolvedValue({ id: 1 });
            vi.mocked(TeamCredential.findOne).mockResolvedValue(null);

            await expect(
                teamCredentialService.getCredential(1),
            ).rejects.toThrow('Credential not found');
        });
    });

    describe('updateCredential', () => {
        it('should update and return credential without apiToken', async () => {
            mockCredential.update.mockResolvedValue(mockCredential);
            vi.mocked(TeamCredential.findOne).mockResolvedValue(
                mockCredential,
            );

            const result = await teamCredentialService.updateCredential(1, {
                apiToken: 'new-token',
            });

            expect(mockCredential.update).toHaveBeenCalledWith({
                apiToken: 'new-token',
            });
            expect(result).not.toHaveProperty('apiToken');
            expect(result.hasApiToken).toBe(true);
        });

        it('should throw 404 if credential not found', async () => {
            vi.mocked(TeamCredential.findOne).mockResolvedValue(null);

            await expect(
                teamCredentialService.updateCredential(999, {
                    apiToken: 'x',
                }),
            ).rejects.toThrow('Credential not found');
        });
    });

    describe('deleteCredential', () => {
        it('should delete the credential', async () => {
            vi.mocked(TeamCredential.findOne).mockResolvedValue(
                mockCredential,
            );

            await teamCredentialService.deleteCredential(1);

            expect(mockCredential.destroy).toHaveBeenCalled();
        });

        it('should throw 404 if credential not found', async () => {
            vi.mocked(TeamCredential.findOne).mockResolvedValue(null);

            await expect(
                teamCredentialService.deleteCredential(999),
            ).rejects.toThrow('Credential not found');
        });
    });
});
