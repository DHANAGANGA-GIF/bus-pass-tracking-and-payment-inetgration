import { createClient } from 'redis';
import { env } from '../config/env.js';

let redisClient: ReturnType<typeof createClient> | null = null;
const memoryStore = new Map<string, { value: string; expiresAt?: number }>();

export async function initRedis() {
  if (!env.REDIS_URL) return;

  try {
    const client = createClient({ url: env.REDIS_URL });
    client.on('error', (err) => console.warn('⚠️ Redis Client Warning:', err.message));
    await client.connect();
    redisClient = client;
    console.log('✅ Connected to Redis cache service.');
  } catch (err) {
    console.warn('⚠️ Redis connection failed. Falling back to in-memory cache.');
  }
}

export async function setCache(key: string, value: any, ttlSeconds: number = 300): Promise<void> {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  if (redisClient && redisClient.isOpen) {
    await redisClient.set(key, serialized, { EX: ttlSeconds });
  } else {
    memoryStore.set(key, {
      value: serialized,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }
}

export async function getCache<T = any>(key: string): Promise<T | null> {
  if (redisClient && redisClient.isOpen) {
    const val = await redisClient.get(key);
    if (!val) return null;
    try {
      return JSON.parse(val) as T;
    } catch {
      return val as unknown as T;
    }
  } else {
    const item = memoryStore.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      memoryStore.delete(key);
      return null;
    }
    try {
      return JSON.parse(item.value) as T;
    } catch {
      return item.value as unknown as T;
    }
  }
}

export async function deleteCache(key: string): Promise<void> {
  if (redisClient && redisClient.isOpen) {
    await redisClient.del(key);
  } else {
    memoryStore.delete(key);
  }
}
