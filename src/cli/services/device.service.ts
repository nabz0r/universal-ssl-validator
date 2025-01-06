import { Device, DeviceMetrics, DeviceCertificate } from '../../core/types/iot';
import { DeviceRepository } from '../db/repositories/device.repository';
import { MetricsRepository } from '../db/repositories/metrics.repository';
import { CacheRepository } from '../db/repositories/cache.repository';
import { logger } from '../../utils/logger';

export class DeviceService {
  constructor(
    private deviceRepo: DeviceRepository,
    private metricsRepo: MetricsRepository,
    private cacheRepo: CacheRepository
  ) {}

  async registerDevice(device: Omit<Device, 'createdAt' | 'updatedAt'>): Promise<void> {
    try {
      await this.deviceRepo.create(device);
      await this.cacheRepo.setDeviceStatus(device.id, 'disconnected');
      logger.info('Device registered successfully', { deviceId: device.id });
    } catch (error) {
      logger.error('Failed to register device', { error, deviceId: device.id });
      throw error;
    }
  }

  async updateDeviceStatus(deviceId: string, status: string): Promise<void> {
    try {
      await Promise.all([
        this.deviceRepo.updateStatus(deviceId, status),
        this.cacheRepo.setDeviceStatus(deviceId, status)
      ]);

      const device = await this.deviceRepo.findById(deviceId);
      if (!device) throw new Error('Device not found');

      const metrics: DeviceMetrics = {
        deviceId,
        status: status as any,
        connected: status === 'connected',
        certDaysRemaining: this.calculateCertDays(device.certificate),
        errorCount: status === 'error' ? 1 : 0,
        latency: 0,
        timestamp: new Date()
      };

      await this.metricsRepo.recordDeviceMetrics(metrics);
    } catch (error) {
      logger.error('Failed to update device status', { error, deviceId });
      throw error;
    }
  }

  async updateDeviceCertificate(
    deviceId: string,
    certificate: DeviceCertificate
  ): Promise<void> {
    try {
      await this.deviceRepo.updateCertificate(deviceId, certificate);
      logger.info('Device certificate updated', { deviceId });
    } catch (error) {
      logger.error('Failed to update device certificate', { error, deviceId });
      throw error;
    }
  }

  async getDeviceById(id: string): Promise<Device | null> {
    try {
      const device = await this.deviceRepo.findById(id);
      if (!device) return null;

      const cachedStatus = await this.cacheRepo.getDeviceStatus(id);
      if (cachedStatus) {
        device.status = cachedStatus as any;
      }

      return device;
    } catch (error) {
      logger.error('Failed to get device', { error, deviceId: id });
      throw error;
    }
  }

  private calculateCertDays(cert: DeviceCertificate): number {
    const now = new Date();
    const validTo = new Date(cert.validTo);
    return Math.ceil((validTo.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }
}