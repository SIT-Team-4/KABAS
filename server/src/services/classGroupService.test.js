import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as classGroupService from './classGroupService.js';
import { ClassGroup, Team } from '../models/index.js';

vi.mock('../models/index.js', () => ({
    ClassGroup: {
        findByPk: vi.fn(),
        findAll: vi.fn(),
        create: vi.fn(),
    },
    Team: {},
}));

describe('classGroupService', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    const mockClassGroup = {
        id: 1,
        name: 'ICT2505C AY25/26 T2',
        startDate: '2026-01-13',
        endDate: '2026-04-25',
        update: vi.fn(),
        destroy: vi.fn(),
    };

    describe('createClassGroup', () => {
        it('should create a class group', async () => {
            vi.mocked(ClassGroup.create).mockResolvedValue(mockClassGroup);

            const data = {
                name: 'ICT2505C AY25/26 T2',
                startDate: '2026-01-13',
                endDate: '2026-04-25',
            };
            const result = await classGroupService.createClassGroup(data);

            expect(ClassGroup.create).toHaveBeenCalledWith(data);
            expect(result).toEqual(mockClassGroup);
        });
    });

    describe('getAllClassGroups', () => {
        it('should return all class groups ordered by createdAt DESC', async () => {
            vi.mocked(ClassGroup.findAll).mockResolvedValue([mockClassGroup]);

            const result = await classGroupService.getAllClassGroups();

            expect(ClassGroup.findAll).toHaveBeenCalledWith({
                order: [['createdAt', 'DESC']],
            });
            expect(result).toHaveLength(1);
        });

        it('should pass limit and offset when provided', async () => {
            vi.mocked(ClassGroup.findAll).mockResolvedValue([mockClassGroup]);

            await classGroupService.getAllClassGroups({
                limit: 10,
                offset: 20,
            });

            expect(ClassGroup.findAll).toHaveBeenCalledWith({
                order: [['createdAt', 'DESC']],
                limit: 10,
                offset: 20,
            });
        });
    });

    describe('getClassGroupById', () => {
        it('should return a class group with its teams', async () => {
            vi.mocked(ClassGroup.findByPk).mockResolvedValue(mockClassGroup);

            const result = await classGroupService.getClassGroupById(1);

            expect(ClassGroup.findByPk).toHaveBeenCalledWith(1, {
                include: [{ model: Team, attributes: ['id', 'name'] }],
            });
            expect(result).toEqual(mockClassGroup);
        });

        it('should throw 404 if class group not found', async () => {
            vi.mocked(ClassGroup.findByPk).mockResolvedValue(null);

            const error = await classGroupService
                .getClassGroupById(999)
                .catch((e) => e);
            expect(error.message).toBe('Class group not found');
            expect(error.status).toBe(404);
        });
    });

    describe('updateClassGroup', () => {
        it('should update and return the class group', async () => {
            const updated = { ...mockClassGroup, name: 'Updated' };
            mockClassGroup.update.mockResolvedValue(updated);
            vi.mocked(ClassGroup.findByPk).mockResolvedValue(mockClassGroup);

            const result = await classGroupService.updateClassGroup(1, {
                name: 'Updated',
            });

            expect(mockClassGroup.update).toHaveBeenCalledWith({
                name: 'Updated',
            });
            expect(result).toEqual(updated);
        });

        it('should throw 404 if class group not found', async () => {
            vi.mocked(ClassGroup.findByPk).mockResolvedValue(null);

            const error = await classGroupService
                .updateClassGroup(999, { name: 'X' })
                .catch((e) => e);
            expect(error.message).toBe('Class group not found');
            expect(error.status).toBe(404);
        });
    });

    describe('deleteClassGroup', () => {
        it('should delete the class group', async () => {
            vi.mocked(ClassGroup.findByPk).mockResolvedValue(mockClassGroup);

            await classGroupService.deleteClassGroup(1);

            expect(mockClassGroup.destroy).toHaveBeenCalled();
        });

        it('should throw 404 if class group not found', async () => {
            vi.mocked(ClassGroup.findByPk).mockResolvedValue(null);

            const error = await classGroupService
                .deleteClassGroup(999)
                .catch((e) => e);
            expect(error.message).toBe('Class group not found');
            expect(error.status).toBe(404);
        });
    });
});
