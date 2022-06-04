import path from 'path';
import express from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import logger from './utils/logger';

dotenv.config();

const app = express();

// SET VIEW ENGINE
app.set('view engine', 'pug');
app.set('view', path.join(__dirname, 'views'));

// MIDDLEWARE
app.use(cookieParser());

// Logger
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

process.on('uncaughtException', (err) => {
  logger.error('UNCAUGHT EXCEPTION 🔥 Shutting down...');
  console.error('Error🔥', err.message);
  process.exit(1);
});

export default app;
