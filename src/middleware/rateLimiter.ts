import { Request, Response, NextFunction } from 'express';
import { RedisCache } from '../db/redis';

export class RateLimiter {
  private cache: RedisCache;
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(
    windowMs = 15 * 60 * 1000,
    maxRequests = 100
  ) {
    this.cache = RedisCache.getInstance();
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  middleware = async (req: Request, res: Response, next: NextFunction) => {
    const key = this.getKey(req);
    
    try {
      const requests = await this.cache.incr(key);
      
      if (requests === 1) {
        await this.cache.expire(key, Math.floor(this.windowMs / 1000));
      }

      if (requests > this.maxRequests) {
        res.status(429).json({
          error: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests, please try again later',
          retryAfter: Math.floor(this.windowMs / 1000)
        });
        return;
      }

      // Rate limit headers
      res.setHeader('X-RateLimit-Limit', this.maxRequests);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, this.maxRequests - requests));
      res.setHeader('X-RateLimit-Reset', Date.now() + this.windowMs);

      next();
    } catch (error) {
      // Fallback in case of Redis error
      console.error('Rate limiter error:', error);
      next();
    }
  };

  private getKey(req: Request): string {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const userId = (req as any).user?.id || 'anonymous';
    return `ratelimit:${ip}:${userId}`;
  }
}