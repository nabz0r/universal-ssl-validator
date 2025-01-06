import { Fleet, FleetConfig, FleetMetrics, Device } from '../../core/types/iot';
import { FleetRepository } from '../db/repositories/fleet.repository';
import { DeviceRepository } from '../db/repositories/device.repository';
import { MetricsRepository } from '../db/repositories/metrics.repository';
import { CacheRepository } from '../db/repositories/cache.repository';
import { logger } from '../../utils/logger';

export class FleetService {
  constructor(
    private fleetRepo: FleetRepository,
    private deviceRepo: DeviceRepository,
    private metricsRepo: MetricsRepository,
    private cacheRepo: CacheRepository
  ) {}

  async createFleet(fleet: Omit<Fleet, 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      await this.fleetRepo.create(fleet);
      logger.info('Fleet created successfully', { fleetId: fleet.id });
    } catch (error) {
      logger.error('Failed to create fleet', { error, fleetId: fleet.id });
      throw error;
    }
  }

  async addDeviceToFleet(fleetId: string, deviceId: string): Promise<void> {
    try {
      const [fleet, device] = await Promise.all([
        this.fleetRepo.findById(fleetId),
        this.deviceRepo.findById(deviceId)
      ]);

      if (!fleet) throw new Error('Fleet not found');
      if (!device) throw new Error('Device not found');
      if (device.fleet) throw new Error('Device already in a fleet');

      await this.deviceRepo.updateStatus(deviceId, { fleet: fleetId });
      logger.info('Device added to fleet', { fleetId, deviceId });
    } catch (error) {
      logger.error('Failed to add device to fleet', { error, fleetId, deviceId });
      throw error;
    }
  }

  async updateFleetConfig(fleetId: string, config: FleetConfig): Promise<void> {
    try {
      await this.fleetRepo.updateConfig(fleetId, config);
      logger.info('Fleet config updated', { fleetId });
    } catch (error) {
      logger.error('Failed to update fleet config', { error, fleetId });
      throw error;
    }
  }

  async getFleetMetrics(fleetId: string): Promise<FleetMetrics | null> {
    try {
      let metrics = await this.cacheRepo.getFleetMetrics(fleetId);
      if (metrics) return metrics;

      const devices = await this.deviceRepo.findByFleet(fleetId);
      if (!devices.length) return null;

      metrics = {
        fleetId,
        totalDevices: devices.length,
        connectedDevices: devices.filter(d => d.status === 'connected').length,
        errorRate: this.calculateErrorRate(devices),
        avgCertDaysRemaining: this.calculateAvgCertDays(devices),
        certRotationsPending: this.calculatePendingRotations(devices),
        timestamp: new Date()
      };

      await Promise.all([
        this.cacheRepo.setFleetMetrics(fleetId, metrics),
        this.metricsRepo.recordFleetMetrics(metrics)
      ]);

      return metrics;
    } catch (error) {
      logger.error('Failed to get fleet metrics', { error, fleetId });
      throw error;
    }
  }

  private calculateErrorRate(devices: Device[]): number {
    return devices.filter(d => d.status === 'error').length / devices.length;
  }

  private calculateAvgCertDays(devices: Device[]): number {
    const days = devices.map(d => {
      const validTo = new Date(d.certificate.validTo);
      const now = new Date();
      return Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    });
    return Math.floor(days.reduce((a, b) => a + b, 0) / devices.length);
  }

  private calculatePendingRotations(devices: Device[]): number {
    return devices.filter(d => {
      const validTo = new Date(d.certificate.validTo);
      const now = new Date();
      const days = Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return days <= 30;
    }).length;
  }
}