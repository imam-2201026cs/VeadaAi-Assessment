import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisClient = createClient({ url: redisUrl });

export const connectRedis = async (): Promise<void> => {
  try {
    redisClient.on('error', (err) => console.error('Redis error:', err));
    await redisClient.connect();
    console.log('✅ Redis connected');
  } catch (err) {
    console.error('❌ Redis connection error:', err);
    process.exit(1);
  }
};

export const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};
