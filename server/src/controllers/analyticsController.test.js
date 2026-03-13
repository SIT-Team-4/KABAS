import { describe, it, expect, vi } from 'vitest';
import * as analyticsController from './analyticsController.js';
import * as analyticsService from '../services/analyticsService.js';

vi.mock('../services/analyticsService.js', () => ({
    getTeamAnalytics: vi.fn(),
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
});
