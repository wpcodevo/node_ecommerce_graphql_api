import { createClient } from 'redis';
import logger from './logger';

const redisUrl = 'redis://localhost:6379';

const redisClient = createClient({
  url: redisUrl,
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    logger.error(error.message);
    setInterval(5000, connectRedis);
  }
};

connectRedis();

redisClient.on('connect', () =>
  logger.info('Redis client connected successfully')
);

redisClient.on('error', (err) => logger.error(err));

export default redisClient;
