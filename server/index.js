import './src/config/env.js';
import app from './src/config/app.js';
import { sequelize } from './src/models/index.js';

const port = process.env.PORT || 3001;

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
