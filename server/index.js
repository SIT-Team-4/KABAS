import './src/config/env.js';
import app from './src/config/app.js';
import { sequelize } from './src/models/index.js';

const port = process.env.PORT || 3001;

const validateSecurityEnv = () => {
    if (process.env.NODE_ENV === 'test') {
        return;
    }

    const required = ['JWT_SECRET', 'ENCRYPTION_KEY', 'ADMIN_API_KEY'];
    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    const invalid = [];

    const jwtSecret = process.env.JWT_SECRET || '';
    if (jwtSecret.length < 16) {
        invalid.push('JWT_SECRET invalid: must be at least 16 characters');
    }

    const adminApiKey = process.env.ADMIN_API_KEY || '';
    if (!/^[A-Za-z0-9_-]{16,}$/.test(adminApiKey)) {
        invalid.push('ADMIN_API_KEY invalid: use [A-Za-z0-9_-] and at least 16 characters');
    }

    const encryptionKey = process.env.ENCRYPTION_KEY || '';
    const isHex = /^[0-9a-fA-F]+$/.test(encryptionKey) && encryptionKey.length % 2 === 0;
    const isBase64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encryptionKey);

    let keyBytes = 0;
    if (isHex) {
        keyBytes = Buffer.from(encryptionKey, 'hex').length;
    } else if (isBase64) {
        keyBytes = Buffer.from(encryptionKey, 'base64').length;
    }

    if (keyBytes < 32) {
        invalid.push('ENCRYPTION_KEY invalid: must be hex/base64 and decode to at least 32 bytes');
    }

    if (invalid.length > 0) {
        throw new Error(`Invalid environment variables: ${invalid.join('; ')}`);
    }
};

const connectWithRetry = async (retries = 5, delay = 3000) => {
    for (let i = 0; i < retries; i++) {
        try {
            // eslint-disable-next-line no-await-in-loop
            await sequelize.authenticate();
            return;
        } catch (err) {
            if (i < retries - 1) {
                console.log(`Database not ready, retrying in ${delay / 1000}s... (${i + 1}/${retries})`);
                // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
                await new Promise((res) => { setTimeout(res, delay); });
            } else {
                throw err;
            }
        }
    }
};

const start = async () => {
    try {
        validateSecurityEnv();
        await connectWithRetry();
        console.log('Database connection established.');

        await sequelize.sync({ alter: true });
        console.log('Models synchronized.');

        app.listen(port, () => {
            console.log(`Server running on http://localhost:${port}`);
        });
    } catch (err) {
        console.error('Unable to start server:', err);
        process.exit(1);
    }
};

start();
