/**
 * @module config/app
 * @description Express application setup with middleware and route mounting.
 */
import express from 'express';
import cors from 'cors';
import routes from '../routes/index.js';
import errorHandler from '../middleware/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', routes);

// Error handling middleware
app.use(errorHandler);

export default app;
