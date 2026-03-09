import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as teamService from './teamService.js';
import { Team, ClassGroup } from '../models/index.js';

vi.mock('../models/index.js', () => ({
    Team: {
        findByPk: vi.fn(),
        findAll: vi.fn(),
        create: vi.fn(),
    },
    ClassGroup: {
        findByPk: vi.fn(),
    },
}));

describe('teamService', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    const mockTeam = {
        id: 1,
        name: 'Team Alpha',
        classGroupId: null,
        update: vi.fn(),
        destroy: vi.fn(),
    };

    describe('createTeam', () => {
        it('should create a team without classGroupId', async () => {
            vi.mocked(Team.create).mockResolvedValue(mockTeam);

            const result = await teamService.createTeam({ name: 'Team Alpha' });

            expect(Team.create).toHaveBeenCalledWith({ name: 'Team Alpha' });
            expect(result).toEqual(mockTeam);
        });

        it('should create a team with valid classGroupId', async () => {
            vi.mocked(ClassGroup.findByPk).mockResolvedValue({ id: 1 });
            vi.mocked(Team.create).mockResolvedValue({
                ...mockTeam,
                classGroupId: 1,
            });

            const result = await teamService.createTeam({
                name: 'Team Alpha',
                classGroupId: 1,
            });

            expect(ClassGroup.findByPk).toHaveBeenCalledWith(1);
            expect(Team.create).toHaveBeenCalled();
            expect(result.classGroupId).toBe(1);
        });

        it('should throw 404 if classGroupId does not exist', async () => {
            vi.mocked(ClassGroup.findByPk).mockResolvedValue(null);

            const error = await teamService
                .createTeam({ name: 'Team Alpha', classGroupId: 999 })
                .catch((e) => e);
            expect(error.message).toBe('Class group not found');
            expect(error.status).toBe(404);
        });
    });

    describe('getAllTeams', () => {
        it('should return all teams', async () => {
            vi.mocked(Team.findAll).mockResolvedValue([mockTeam]);

            const result = await teamService.getAllTeams();

            expect(Team.findAll).toHaveBeenCalledWith({
                where: {},
                include: [
                    { model: ClassGroup, attributes: ['id', 'name'] },
                ],
                order: [['createdAt', 'DESC']],
            });
            expect(result).toHaveLength(1);
        });

        it('should filter by classGroupId', async () => {
            vi.mocked(Team.findAll).mockResolvedValue([]);

            await teamService.getAllTeams({ classGroupId: 5 });

            expect(Team.findAll).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { classGroupId: 5 },
                }),
            );
        });
    });

    describe('getTeamById', () => {
        it('should return a team by id', async () => {
            vi.mocked(Team.findByPk).mockResolvedValue(mockTeam);

            const result = await teamService.getTeamById(1);

            expect(result).toEqual(mockTeam);
        });

        it('should throw 404 if team not found', async () => {
            vi.mocked(Team.findByPk).mockResolvedValue(null);

            const error = await teamService.getTeamById(999).catch((e) => e);
            expect(error.message).toBe('Team not found');
            expect(error.status).toBe(404);
        });
    });

    describe('updateTeam', () => {
        it('should update a team', async () => {
            const updated = { ...mockTeam, name: 'Updated' };
            mockTeam.update.mockResolvedValue(updated);
            vi.mocked(Team.findByPk).mockResolvedValue(mockTeam);

            const result = await teamService.updateTeam(1, {
                name: 'Updated',
            });

            expect(mockTeam.update).toHaveBeenCalledWith({ name: 'Updated' });
            expect(result).toEqual(updated);
        });

        it('should throw 404 if team not found', async () => {
            vi.mocked(Team.findByPk).mockResolvedValue(null);

            const error = await teamService
                .updateTeam(999, { name: 'X' })
                .catch((e) => e);
            expect(error.message).toBe('Team not found');
            expect(error.status).toBe(404);
        });

        it('should throw 404 if classGroupId does not exist on update', async () => {
            vi.mocked(Team.findByPk).mockResolvedValue({
                ...mockTeam,
                update: vi.fn(),
            });
            vi.mocked(ClassGroup.findByPk).mockResolvedValue(null);

            const error = await teamService
                .updateTeam(1, { classGroupId: 999 })
                .catch((e) => e);
            expect(error.message).toBe('Class group not found');
            expect(error.status).toBe(404);
        });
    });

    describe('deleteTeam', () => {
        it('should delete the team', async () => {
            vi.mocked(Team.findByPk).mockResolvedValue(mockTeam);

            await teamService.deleteTeam(1);

            expect(mockTeam.destroy).toHaveBeenCalled();
        });

        it('should throw 404 if team not found', async () => {
            vi.mocked(Team.findByPk).mockResolvedValue(null);

            const error = await teamService.deleteTeam(999).catch((e) => e);
            expect(error.message).toBe('Team not found');
            expect(error.status).toBe(404);
        });
    });
});
