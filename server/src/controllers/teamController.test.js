import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as teamController from './teamController.js';
import * as teamService from '../services/teamService.js';

vi.mock('../services/teamService.js');

describe('teamController', () => {
    beforeEach(() => {
        vi.clearAllMocks();
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
