import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as classGroupController from './classGroupController.js';
import * as classGroupService from '../services/classGroupService.js';

vi.mock('../services/classGroupService.js');

describe('classGroupController', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    const mockClassGroup = {
        id: 1,
        name: 'ICT2505C AY25/26 T2',
        startDate: '2026-01-13',
        endDate: '2026-04-25',
    };

    describe('create', () => {
        it('should create a class group and return 201', async () => {
            vi.mocked(classGroupService.createClassGroup).mockResolvedValue(
                mockClassGroup,
            );

            const req = {
                body: {
                    name: 'ICT2505C AY25/26 T2',
                    startDate: '2026-01-13',
                    endDate: '2026-04-25',
                },
            };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await classGroupController.create(req, res, vi.fn());

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockClassGroup,
            });
        });

        it('should return 400 on validation error', async () => {
            const req = { body: {} };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await classGroupController.create(req, res, vi.fn());

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: false }),
            );
        });
    });

    describe('getAll', () => {
        it('should return all class groups', async () => {
            vi.mocked(classGroupService.getAllClassGroups).mockResolvedValue([
                mockClassGroup,
            ]);

            const req = { query: {} };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await classGroupController.getAll(req, res, vi.fn());

            expect(classGroupService.getAllClassGroups).toHaveBeenCalledWith({
                limit: undefined,
                offset: undefined,
            });
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: [mockClassGroup],
            });
        });

        it('should forward limit and offset query params', async () => {
            vi.mocked(classGroupService.getAllClassGroups).mockResolvedValue([]);

            const req = { query: { limit: '10', offset: '20' } };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await classGroupController.getAll(req, res, vi.fn());

            expect(classGroupService.getAllClassGroups).toHaveBeenCalledWith({
                limit: 10,
                offset: 20,
            });
        });
    });

    describe('getById', () => {
        it('should return a class group', async () => {
            vi.mocked(classGroupService.getClassGroupById).mockResolvedValue(
                mockClassGroup,
            );

            const req = { params: { id: '1' } };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await classGroupController.getById(req, res, vi.fn());

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockClassGroup,
            });
        });

        it('should call next on service error', async () => {
            vi.mocked(classGroupService.getClassGroupById).mockRejectedValue(
                new Error('Class group not found'),
            );

            const req = { params: { id: '999' } };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
            const next = vi.fn();

            await classGroupController.getById(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('update', () => {
        it('should update a class group and return it', async () => {
            const updated = { ...mockClassGroup, name: 'Updated Name' };
            vi.mocked(classGroupService.updateClassGroup).mockResolvedValue(
                updated,
            );

            const req = {
                params: { id: '1' },
                body: { name: 'Updated Name' },
            };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await classGroupController.update(req, res, vi.fn());

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: updated,
            });
        });

        it('should return 400 on validation error', async () => {
            const req = {
                params: { id: '1' },
                body: { startDate: '2026-01-13' },
            };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await classGroupController.update(req, res, vi.fn());

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({ success: false }),
            );
        });

        it('should call next on service error', async () => {
            vi.mocked(classGroupService.updateClassGroup).mockRejectedValue(
                new Error('Class group not found'),
            );

            const req = {
                params: { id: '999' },
                body: { name: 'Updated' },
            };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };
            const next = vi.fn();

            await classGroupController.update(req, res, next);

            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('remove', () => {
        it('should delete and return success message', async () => {
            vi.mocked(classGroupService.deleteClassGroup).mockResolvedValue();

            const req = { params: { id: '1' } };
            const res = { json: vi.fn(), status: vi.fn().mockReturnThis() };

            await classGroupController.remove(req, res, vi.fn());

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Class group deleted',
            });
        });
    });
});
