import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as teamCredentialController from './teamCredentialController.js';
import * as teamCredentialService from '../services/teamCredentialService.js';

vi.mock('../services/teamCredentialService.js');

describe('teamCredentialController', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    const mockCredential = {
        id: 1,
        teamId: 1,
        provider: 'jira',
        baseUrl: 'https://example.atlassian.net',
        email: 'test@example.com',
        hasApiToken: true,
    };

    describe('create', () => {
        it('should create a credential and return 201', async () => {
            vi.mocked(teamCredentialService.createCredential).mockResolvedValue(
                mockCredential,
            );

            const req = {
                params: { teamId: '1' },
                body: {
                    provider: 'jira',
                    baseUrl: 'https://example.atlassian.net',
                    email: 'test@example.com',
                    apiToken: 'secret',
                },
            };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await teamCredentialController.create(req, res, vi.fn());

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockCredential,
            });
        });

        it('should return 400 on validation error (missing provider)', async () => {
            const req = {
                params: { teamId: '1' },
                body: { apiToken: 'secret' },
            };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await teamCredentialController.create(req, res, vi.fn());

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: false }),
            );
        });

        it('should return 400 on validation error (invalid provider)', async () => {
            const req = {
                params: { teamId: '1' },
                body: { provider: 'gitlab', apiToken: 'secret' },
            };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await teamCredentialController.create(req, res, vi.fn());

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should call next on service error', async () => {
            vi.mocked(teamCredentialService.createCredential).mockRejectedValue(
                new Error('Team not found'),
            );

            const req = {
                params: { teamId: '999' },
                body: {
                    provider: 'github',
                    apiToken: 'secret',
                },
            };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
            const next = vi.fn();

            await teamCredentialController.create(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('get', () => {
        it('should return credential data', async () => {
            vi.mocked(teamCredentialService.getCredential).mockResolvedValue(
                mockCredential,
            );

            const req = { params: { teamId: '1' } };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await teamCredentialController.get(req, res, vi.fn());

            const jsonArg = res.json.mock.calls[0][0];
            expect(jsonArg.success).toBe(true);
            expect(jsonArg.data).toEqual(mockCredential);
            expect(jsonArg.data.hasApiToken).toBe(true);
            expect(jsonArg.data).not.toHaveProperty('apiToken');
        });

        it('should call next on service error', async () => {
            vi.mocked(teamCredentialService.getCredential).mockRejectedValue(
                new Error('Credential not found'),
            );

            const req = { params: { teamId: '1' } };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
            const next = vi.fn();

            await teamCredentialController.get(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('update', () => {
        it('should update credential', async () => {
            vi.mocked(
                teamCredentialService.updateCredential,
            ).mockResolvedValue(mockCredential);

            const req = {
                params: { teamId: '1' },
                body: { apiToken: 'new-token' },
            };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await teamCredentialController.update(req, res, vi.fn());

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockCredential,
            });
        });

        it('should return 400 on invalid provider value', async () => {
            const req = {
                params: { teamId: '1' },
                body: { provider: 'bitbucket' },
            };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await teamCredentialController.update(req, res, vi.fn());

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('remove', () => {
        it('should delete credential', async () => {
            vi.mocked(
                teamCredentialService.deleteCredential,
            ).mockResolvedValue();

            const req = { params: { teamId: '1' } };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await teamCredentialController.remove(req, res, vi.fn());

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Credential deleted',
            });
        });

        it('should call next on service error', async () => {
            vi.mocked(
                teamCredentialService.deleteCredential,
            ).mockRejectedValue(new Error('Credential not found'));

            const req = { params: { teamId: '1' } };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
            const next = vi.fn();

            await teamCredentialController.remove(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });
});
