import { describe, it, expect, vi } from 'vitest';
import * as analyticsController from './analyticsController.js';
import * as analyticsService from '../services/analyticsService.js';

vi.mock('../services/analyticsService.js', () => ({
    getTeamAnalytics: vi.fn(),
    getAllTeamsAnalytics: vi.fn(),
}));

describe('Analytics Controller', () => {
    describe('getTeamAnalytics', () => {
        it('should return analytics data with success true', async () => {
            const mockData = { velocity: 10, completedTasks: 5 };
            vi.mocked(analyticsService.getTeamAnalytics).mockResolvedValue(mockData);

            const req = { params: { teamId: '1' } };
            const res = { json: vi.fn() };
            const next = vi.fn();

            await analyticsController.getTeamAnalytics(req, res, next);

            expect(res.json).toHaveBeenCalledWith({ success: true, data: mockData });
            expect(next).not.toHaveBeenCalled();
        });

        it('should call next with error when service throws', async () => {
            const error = new Error('Service error');
            vi.mocked(analyticsService.getTeamAnalytics).mockRejectedValue(error);

            const req = { params: { teamId: '1' } };
            const res = { json: vi.fn() };
            const next = vi.fn();

            await analyticsController.getTeamAnalytics(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(res.json).not.toHaveBeenCalled();
        });

        it('should extract teamId from req.params and pass it to the service', async () => {
            vi.mocked(analyticsService.getTeamAnalytics).mockResolvedValue({});

            const req = { params: { teamId: '42' } };
            const res = { json: vi.fn() };
            const next = vi.fn();

            await analyticsController.getTeamAnalytics(req, res, next);

            expect(analyticsService.getTeamAnalytics).toHaveBeenCalledWith('42');
        });
    });

    describe('getAllTeamsAnalytics', () => {
        it('should return analytics data with success true', async () => {
            const mockData = [{ teamId: 1, velocity: 10 }];
            vi.mocked(analyticsService.getAllTeamsAnalytics).mockResolvedValue(mockData);

            const req = { query: {} };
            const res = { json: vi.fn() };
            const next = vi.fn();

            await analyticsController.getAllTeamsAnalytics(req, res, next);

            expect(res.json).toHaveBeenCalledWith({ success: true, data: mockData });
            expect(next).not.toHaveBeenCalled();
        });

        it('should pass classGroupId as Number when provided in query', async () => {
            vi.mocked(analyticsService.getAllTeamsAnalytics).mockResolvedValue([]);

            const req = { query: { classGroupId: '1' } };
            const res = { json: vi.fn() };
            const next = vi.fn();

            await analyticsController.getAllTeamsAnalytics(req, res, next);

            expect(analyticsService.getAllTeamsAnalytics).toHaveBeenCalledWith({ classGroupId: 1 });
        });

        it('should pass classGroupId as undefined when not provided in query', async () => {
            vi.mocked(analyticsService.getAllTeamsAnalytics).mockResolvedValue([]);

            const req = { query: {} };
            const res = { json: vi.fn() };
            const next = vi.fn();

            await analyticsController.getAllTeamsAnalytics(req, res, next);

            expect(analyticsService.getAllTeamsAnalytics).toHaveBeenCalledWith({ classGroupId: undefined });
        });

        it('should call next with error when service throws', async () => {
            const error = new Error('Service error');
            vi.mocked(analyticsService.getAllTeamsAnalytics).mockRejectedValue(error);

            const req = { query: {} };
            const res = { json: vi.fn() };
            const next = vi.fn();

            await analyticsController.getAllTeamsAnalytics(req, res, next);

            expect(next).toHaveBeenCalledWith(error);
            expect(res.json).not.toHaveBeenCalled();
        });
    });
});
