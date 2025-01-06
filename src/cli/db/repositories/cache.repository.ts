import { DatabaseManager } from '../index';
import { redisKeys } from '../schemas';

export class CacheRepository {
  private redisClient;

  constructor() {
    const dbManager = DatabaseManager.getInstance();
    this.redisClient = dbManager.getRedis();
  }

  async setCertValidation(domain: string, result: any, ttl: number = 3600) {
    const key = redisKeys.certValidation(domain);
    await this.redisClient.set(key, JSON.stringify(result), { EX: ttl });
  }

  async getCertValidation(domain: string) {
    const key = redisKeys.certValidation(domain);
    const data = await this.redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }

  async setDeviceStatus(deviceId: string, status: string) {
    const key = redisKeys.deviceStatus(deviceId);
    const lastSeenKey = redisKeys.deviceLastSeen(deviceId);

    await Promise.all([
      this.redisClient.set(key, status),
      this.redisClient.set(lastSeenKey, new Date().toISOString())
    ]);
  }

  async getDeviceStatus(deviceId: string) {
    const key = redisKeys.deviceStatus(deviceId);
    return this.redisClient.get(key);
  }

  async setFleetMetrics(fleetId: string, metrics: any, ttl: number = 300) {
    const key = redisKeys.fleetMetrics(fleetId);
    await this.redisClient.set(key, JSON.stringify(metrics), { EX: ttl });
  }

  async getFleetMetrics(fleetId: string) {
    const key = redisKeys.fleetMetrics(fleetId);
    const data = await this.redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }

  async checkRateLimit(key: string, limit: number, window: number): Promise<boolean> {
    const rateKey = redisKeys.rateLimit(key);
    const count = await this.redisClient.incr(rateKey);
    
    if (count === 1) {
      await this.redisClient.expire(rateKey, window);
    }
    
    return count <= limit;
  }
}