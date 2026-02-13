require('dotenv').config({ path: '../.env' });

const app = require('./src/config/app');
const { sequelize } = require('./src/models');

const port = process.env.PORT || 3001;

const connectWithRetry = async (retries = 5, delay = 3000) => {
    for (let i = 0; i < retries; i++) {
        try {
            await sequelize.authenticate();
            return;
        } catch (err) {
            if (i < retries - 1) {
                console.log(`Database not ready, retrying in ${delay / 1000}s... (${i + 1}/${retries})`);
                await new Promise((res) => setTimeout(res, delay));
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
