import { Request, Response, NextFunction } from 'express';
import { getCache, setCache } from '../services/redis.js';

export function cacheMiddleware(ttlSeconds: number = 60) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `api_cache:${req.originalUrl || req.url}`;
    try {
      const cached = await getCache(key);
      if (cached) {
        return res.json(cached);
      }

      const originalJson = res.json.bind(res);
      res.json = (body: any): Response => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          setCache(key, body, ttlSeconds).catch(() => {});
        }
        return originalJson(body);
      };

      next();
    } catch {
      next();
    }
  };
}
