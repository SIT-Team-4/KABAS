import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as teamController from './teamController.js';
import * as teamService from '../services/teamService.js';

vi.mock('../services/teamService.js');

describe('teamController', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    const mockTeam = { id: 1, name: 'Team Alpha', classGroupId: null };

    describe('create', () => {
        it('should create a team and return 201', async () => {
            vi.mocked(teamService.createTeam).mockResolvedValue(mockTeam);

            const req = { body: { name: 'Team Alpha' } };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await teamController.create(req, res, vi.fn());

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockTeam,
            });
        });

        it('should return 400 when name is missing', async () => {
            const req = { body: {} };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await teamController.create(req, res, vi.fn());

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('getAll', () => {
        it('should return all teams', async () => {
            vi.mocked(teamService.getAllTeams).mockResolvedValue([mockTeam]);

            const req = { query: {} };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await teamController.getAll(req, res, vi.fn());

            expect(teamService.getAllTeams).toHaveBeenCalledWith({});
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: [mockTeam],
            });
        });

        it('should pass classGroupId query filter', async () => {
            vi.mocked(teamService.getAllTeams).mockResolvedValue([]);

            const req = { query: { classGroupId: '5' } };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await teamController.getAll(req, res, vi.fn());

            expect(teamService.getAllTeams).toHaveBeenCalledWith({
                classGroupId: '5',
            });
        });
    });

    describe('getById', () => {
        it('should return a team', async () => {
            vi.mocked(teamService.getTeamById).mockResolvedValue(mockTeam);

            const req = { params: { teamId: '1' } };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await teamController.getById(req, res, vi.fn());

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockTeam,
            });
        });
    });

    describe('update', () => {
        it('should update a team and return it', async () => {
            const updated = { ...mockTeam, name: 'Updated' };
            vi.mocked(teamService.updateTeam).mockResolvedValue(updated);

            const req = {
                params: { teamId: '1' },
                body: { name: 'Updated' },
            };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await teamController.update(req, res, vi.fn());

            expect(teamService.updateTeam).toHaveBeenCalledWith('1', {
                name: 'Updated',
            });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updated,
            });
        });

        it('should return 400 on validation error', async () => {
            const req = {
                params: { teamId: '1' },
                body: { name: '' },
            };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await teamController.update(req, res, vi.fn());

            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should call next on service error', async () => {
            vi.mocked(teamService.updateTeam).mockRejectedValue(
                new Error('Team not found'),
            );

            const req = {
                params: { teamId: '999' },
                body: { name: 'Updated' },
            };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
            const next = vi.fn();

            await teamController.update(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('remove', () => {
        it('should delete team and return success', async () => {
            vi.mocked(teamService.deleteTeam).mockResolvedValue();

            const req = { params: { teamId: '1' } };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await teamController.remove(req, res, vi.fn());

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Team deleted',
            });
        });
    });
});
