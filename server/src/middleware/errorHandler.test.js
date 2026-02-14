import { describe, it, expect, vi } from 'vitest';
import errorHandler from './errorHandler.js';

describe('errorHandler', () => {
    const mockRes = () => {
        const res = {};
        res.status = vi.fn().mockReturnValue(res);
        res.json = vi.fn().mockReturnValue(res);
        return res;
    };

    it.each([
        {
            name: 'defaults to 500 and generic message',
            err: { stack: 'stack trace' },
            expectedStatus: 500,
            expectedError: 'Internal Server Error',
        },
        {
            name: 'uses custom status code and message',
            err: { status: 404, message: 'Not Found', stack: 'stack trace' },
            expectedStatus: 404,
            expectedError: 'Not Found',
        },
        {
            name: 'uses custom message with default 500',
            err: { message: 'Something went wrong', stack: 'stack trace' },
            expectedStatus: 500,
            expectedError: 'Something went wrong',
        },
    ])('$name', ({ err, expectedStatus, expectedError }) => {
        const res = mockRes();

        errorHandler(err, {}, res, () => {});

        expect(res.status).toHaveBeenCalledWith(expectedStatus);
        expect(res.json).toHaveBeenCalledWith({ error: expectedError });
    });
});
