import { TimescaleDB } from '../db/timescale';
import { MongoDB } from '../db/mongo';
import { RedisCache } from '../db/redis';
import { Device, DeviceStatus } from './types';

class IoTMetricsService {
  private timescaleDb: TimescaleDB;
  private mongoDb: MongoDB;
  private cache: RedisCache;

  constructor() {
    this.timescaleDb = TimescaleDB.getInstance();
    this.mongoDb = MongoDB.getInstance();
    this.cache = RedisCache.getInstance();
  }

  async storeDeviceMetrics(deviceId: string, metrics: any): Promise<void> {
    // Stockage des métriques en temps réel dans TimescaleDB
    await this.timescaleDb.query(`
      INSERT INTO device_metrics (
        device_id,
        cpu_usage,
        memory_usage,
        network_latency,
        certificate_status,
        timestamp
      ) VALUES ($1, $2, $3, $4, $5, NOW())
    `, [
      deviceId,
      metrics.cpuUsage,
      metrics.memoryUsage,
      metrics.networkLatency,
      metrics.certificateStatus
    ]);

    // Mise à jour du cache Redis
    await this.cache.setDeviceMetrics(deviceId, metrics, 300); // TTL 5 minutes

    // Stockage des analyses dans MongoDB
    await this.mongoDb.getCollection('device_analytics').updateOne(
      { deviceId },
      {
        $push: {
          metrics: {
            ...metrics,
            timestamp: new Date()
          }
        }
      },
      { upsert: true }
    );
  }

  async getDeviceMetrics(deviceId: string, timeRange: string): Promise<any[]> {
    // Vérifier le cache d'abord
    const cachedMetrics = await this.cache.getDeviceMetrics(deviceId);
    if (cachedMetrics) {
      return cachedMetrics;
    }

    // Récupérer de TimescaleDB
    return await this.timescaleDb.query(`
      SELECT *
      FROM device_metrics
      WHERE device_id = $1
      AND timestamp > NOW() - INTERVAL '${timeRange}'
      ORDER BY timestamp DESC
    `, [deviceId]);
  }

  async getAggregatedMetrics(timeRange: string): Promise<any> {
    const cacheKey = `aggregated_metrics:${timeRange}`;
    
    // Vérifier le cache
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    // Agrégation depuis TimescaleDB
    const metrics = await this.timescaleDb.query(`
      SELECT 
        time_bucket('1 hour', timestamp) AS hour,
        COUNT(*) as device_count,
        AVG(cpu_usage) as avg_cpu,
        AVG(memory_usage) as avg_memory,
        AVG(network_latency) as avg_latency,
        COUNT(CASE WHEN certificate_status = 'valid' THEN 1 END) as valid_certs
      FROM device_metrics
      WHERE timestamp > NOW() - INTERVAL '${timeRange}'
      GROUP BY hour
      ORDER BY hour DESC
    `);

    // Mise en cache
    await this.cache.set(cacheKey, JSON.stringify(metrics), 300);

    return metrics;
  }

  async storeDeviceStatus(deviceId: string, status: DeviceStatus): Promise<void> {
    // Mise à jour du statut dans MongoDB
    await this.mongoDb.getCollection('devices').updateOne(
      { _id: deviceId },
      {
        $set: {
          lastStatus: status,
          lastUpdate: new Date()
        }
      }
    );

    // Mise en cache
    await this.cache.setDeviceStatus(deviceId, status);

    // Enregistrement de l'historique dans TimescaleDB
    await this.timescaleDb.query(`
      INSERT INTO device_status_history (
        device_id,
        status,
        timestamp
      ) VALUES ($1, $2, NOW())
    `, [deviceId, status.status]);
  }

  async getDeviceStatus(deviceId: string): Promise<DeviceStatus | null> {
    // Vérifier le cache
    const cached = await this.cache.getDeviceStatus(deviceId);
    if (cached) {
      return cached;
    }

    // Récupérer de MongoDB
    const device = await this.mongoDb.getCollection('devices').findOne({ _id: deviceId });
    if (device?.lastStatus) {
      await this.cache.setDeviceStatus(deviceId, device.lastStatus);
      return device.lastStatus;
    }

    return null;
  }
}

export default IoTMetricsService;