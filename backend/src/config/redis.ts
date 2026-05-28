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

const url = process.env.REDIS_URL ? new URL(process.env.REDIS_URL) : null;

export const redisConnection = url ? {
  host: url.hostname,
  port: parseInt(url.port || '6379'),
  password: url.password || undefined,
  tls: url.protocol === 'rediss:' ? {} : undefined,
} : {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
};
