import { MetricsRepository } from '../db/repositories/metrics.repository';
import { CacheRepository } from '../db/repositories/cache.repository';
import { DeviceService } from './device.service';
import { FleetService } from './fleet.service';
import { Device, Fleet, DeviceMetrics, FleetMetrics } from '../../core/types/iot';
import { logger } from '../../utils/logger';

export class MonitoringService {
  private monitoringIntervals: Map<string, NodeJS.Timer> = new Map();

  constructor(
    private metricsRepo: MetricsRepository,
    private cacheRepo: CacheRepository,
    private deviceService: DeviceService,
    private fleetService: FleetService
  ) {}

  async startDeviceMonitoring(deviceId: string, interval: number): Promise<void> {
    if (this.monitoringIntervals.has(deviceId)) {
      throw new Error('Device already being monitored');
    }

    const timer = setInterval(async () => {
      try {
        const device = await this.deviceService.getDeviceById(deviceId);
        if (!device) {
          this.stopDeviceMonitoring(deviceId);
          return;
        }

        const metrics = await this.collectDeviceMetrics(device);
        await this.metricsRepo.recordDeviceMetrics(metrics);

        logger.debug('Device metrics collected', { deviceId, metrics });
      } catch (error) {
        logger.error('Failed to collect device metrics', { error, deviceId });
      }
    }, interval);

    this.monitoringIntervals.set(deviceId, timer);
  }

  async startFleetMonitoring(fleetId: string, interval: number): Promise<void> {
    if (this.monitoringIntervals.has(fleetId)) {
      throw new Error('Fleet already being monitored');
    }

    const timer = setInterval(async () => {
      try {
        const metrics = await this.fleetService.getFleetMetrics(fleetId);
        if (!metrics) {
          this.stopFleetMonitoring(fleetId);
          return;
        }

        await Promise.all([
          this.metricsRepo.recordFleetMetrics(metrics),
          this.checkFleetAlerts(fleetId, metrics)
        ]);

        logger.debug('Fleet metrics collected', { fleetId, metrics });
      } catch (error) {
        logger.error('Failed to collect fleet metrics', { error, fleetId });
      }
    }, interval);

    this.monitoringIntervals.set(fleetId, timer);
  }

  stopDeviceMonitoring(deviceId: string): void {
    const timer = this.monitoringIntervals.get(deviceId);
    if (timer) {
      clearInterval(timer);
      this.monitoringIntervals.delete(deviceId);
    }
  }

  stopFleetMonitoring(fleetId: string): void {
    const timer = this.monitoringIntervals.get(fleetId);
    if (timer) {
      clearInterval(timer);
      this.monitoringIntervals.delete(fleetId);
    }
  }

  private async collectDeviceMetrics(device: Device): Promise<DeviceMetrics> {
    return {
      deviceId: device.id,
      status: device.status,
      connected: device.status === 'connected',
      certDaysRemaining: this.calculateCertDays(device),
      errorCount: device.status === 'error' ? 1 : 0,
      latency: await this.measureDeviceLatency(device),
      timestamp: new Date()
    };
  }

  private async measureDeviceLatency(device: Device): Promise<number> {
    const start = process.hrtime();
    try {
      await this.deviceService.getDeviceById(device.id);
      const [seconds, nanoseconds] = process.hrtime(start);
      return Math.floor((seconds * 1000) + (nanoseconds / 1e6));
    } catch {
      return -1;
    }
  }

  private calculateCertDays(device: Device): number {
    const validTo = new Date(device.certificate.validTo);
    const now = new Date();
    return Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  private async checkFleetAlerts(fleetId: string, metrics: FleetMetrics): Promise<void> {
    const alerts = [];

    // Error rate alert
    if (metrics.errorRate > 0.1) {
      alerts.push({
        type: 'ERROR_RATE',
        level: 'warning',
        message: `High error rate: ${(metrics.errorRate * 100).toFixed(1)}%`
      });
    }

    // Certificate expiry alerts
    if (metrics.avgCertDaysRemaining < 30) {
      alerts.push({
        type: 'CERT_EXPIRY',
        level: 'warning',
        message: `Average certificate validity: ${metrics.avgCertDaysRemaining} days`
      });
    }

    // Connectivity alerts
    const disconnectedRate = 1 - (metrics.connectedDevices / metrics.totalDevices);
    if (disconnectedRate > 0.2) {
      alerts.push({
        type: 'CONNECTIVITY',
        level: 'error',
        message: `High disconnection rate: ${(disconnectedRate * 100).toFixed(1)}%`
      });
    }

    // Record alerts
    if (alerts.length > 0) {
      logger.warn('Fleet alerts detected', { fleetId, alerts });
      await this.cacheRepo.setFleetMetrics(fleetId, { ...metrics, alerts });
    }
  }
}