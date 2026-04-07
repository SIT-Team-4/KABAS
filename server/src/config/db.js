/**
 * @module config/db
 * @description Sequelize instance configured from environment variables.
 */
import { Sequelize } from 'sequelize';

const dialectOptions = process.env.DB_SSL === 'true'
    ? { ssl: { rejectUnauthorized: true } }
    : {};

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false,
        dialectOptions,
    },
);

export default sequelize;
