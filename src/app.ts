import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import passport from 'passport';
import cors from 'cors';

import * as middlewares from './middlewares';
import api from './api';
import MessageResponse from './types/messageResponse';
import path from 'path';
import { scheduleClearBulkOperationFailuresJob } from './jobs/clearBulkOperationFailuresJob';

require('dotenv').config();

const app = express();

app.set('trust proxy', true); // Trust ngrok/Render proxies

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(passport.initialize()); // Initialize Passport

// Serve static files from the downloads directory
app.use('/downloads', express.static(path.join(__dirname, '../downloads')));

app.get<{}, MessageResponse>('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄',
  });
});

app.use('/api/v1', api);
// Start the cron job when the application starts
scheduleClearBulkOperationFailuresJob();

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
