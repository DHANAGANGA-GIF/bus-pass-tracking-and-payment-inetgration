import { createClient } from 'redis';
import { env } from './env.js';

class MockRedis {
  private store = new Map<string, string>();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  async set(key: string, value: string, options?: { EX?: number }): Promise<string> {
    this.store.set(key, value);
    if (options?.EX) {
      setTimeout(() => this.store.delete(key), options.EX * 1000);
    }
    return 'OK';
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async incr(key: string): Promise<number> {
    const val = parseInt(this.store.get(key) || '0', 10) + 1;
    this.store.set(key, val.toString());
    return val;
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    setTimeout(() => this.store.delete(key), seconds * 1000);
    return true;
  }
}

let redisClient: any;

try {
  const realClient = createClient({ url: env.REDIS_URL });
  realClient.on('error', (err) => {
    console.warn('[Redis] Connection error, using in-memory store:', err.message);
  });
  // Non-blocking connect
  realClient.connect().catch(() => {});
  redisClient = realClient;
} catch {
  redisClient = new MockRedis();
}

export const redis = redisClient.isReady ? redisClient : new MockRedis();
