import { describe, it, expect } from 'vitest';
import express from 'express';
import request from 'supertest';
import router from './index.js';

const app = express();
app.use('/', router);

describe('routes', () => {
    it.each([
        {
            name: 'GET / returns welcome message',
            method: 'get',
            path: '/',
            expectedStatus: 200,
            expectedBody: { message: 'Welcome to the KABAS API' },
        },
    ])('$name', async ({ method, path, expectedStatus, expectedBody }) => {
        const res = await request(app)[method](path);

        expect(res.status).toBe(expectedStatus);
        expect(res.body).toEqual(expectedBody);
    });
});
