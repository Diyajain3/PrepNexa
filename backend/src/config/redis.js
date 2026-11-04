import Redis from 'ioredis';
import { env } from './env.js';

export const redis = new Redis(env.redisUrl || 'redis://127.0.0.1:6379', {
  lazyConnect: true,
  maxRetriesPerRequest: 1,
  enableOfflineQueue: false,
  retryStrategy(times) {
    if (times > 3) return null; // stop reconnecting if redis is not running
    return Math.min(times * 200, 2000);
  },
});

redis.on('error', (err) => {
  // Catch error event so process doesn't crash on unhandled error
});
