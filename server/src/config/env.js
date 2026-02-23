/**
 * @module config/env
 * @description Loads environment variables from the .env file via dotenv.
 */
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });
