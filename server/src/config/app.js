/**
 * @module config/app
 * @description Express application setup with middleware and route mounting.
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from '../routes/index.js';
import errorHandler from '../middleware/errorHandler.js';

const app = express();

const corsAllowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const corsOptions = {
    origin(origin, callback) {
        // Allow requests with no Origin header (server-to-server, Postman, cURL).
        // These are still authenticated via x-api-key or JWT, not restricted by CORS.
        if (!origin || corsAllowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        const error = new Error('Origin not allowed by CORS policy');
        error.status = 403;
        return callback(error);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    maxAge: 600,
};

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many authentication attempts, please try again later' },
});

app.set('trust proxy', 1);
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors(corsOptions));
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authLimiter);
app.use('/api', apiLimiter);

// Routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

export default app;
