import { Device, DeviceConfig } from './device';
import { logger } from '../../utils/logger';

export class DeviceRegistry {
  private devices: Map<string, Device> = new Map();
  private readonly maxDevices: number;

  constructor(maxDevices: number = 1000) {
    this.maxDevices = maxDevices;
  }

  async register(config: DeviceConfig): Promise<Device> {
    if (this.devices.size >= this.maxDevices) {
      throw new Error('Maximum device limit reached');
    }

    if (this.devices.has(config.id)) {
      throw new Error(`Device ${config.id} already registered`);
    }

    try {
      const device = new Device(config);
      this.devices.set(config.id, device);

      device.on('status', (status) => {
        logger.info('Device status update', { deviceId: config.id, status });
      });

      device.on('cert-expiring', (days) => {
        logger.warn('Device certificate expiring', { deviceId: config.id, days });
      });

      logger.info('Device registered', { deviceId: config.id });
      return device;

    } catch (error) {
      logger.error('Failed to register device', { deviceId: config.id, error });
      throw error;
    }
  }

  async unregister(deviceId: string): Promise<void> {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    this.devices.delete(deviceId);
    logger.info('Device unregistered', { deviceId });
  }

  getDevice(deviceId: string): Device | undefined {
    return this.devices.get(deviceId);
  }

  listDevices(filter?: { type?: string; status?: string }): Device[] {
    let devices = Array.from(this.devices.values());

    if (filter?.type) {
      devices = devices.filter(d => d.type === filter.type);
    }

    if (filter?.status) {
      devices = devices.filter(d => d.getStatus() === filter.status);
    }

    return devices;
  }

  connectedCount(): number {
    return this.listDevices({ status: 'connected' }).length;
  }

  totalCount(): number {
    return this.devices.size;
  }
}