import mongoose from 'mongoose';
import dotenv from 'dotenv';
import logger from './logger';

dotenv.config();

const localUri = process.env.MONGODB_URI_LOCAL;
const dbUri = process.env.MONGODB_URI;

async function connectDB() {
  try {
    await mongoose.connect(localUri);
    logger.info('Database connected successfully');
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
}

export default connectDB;
