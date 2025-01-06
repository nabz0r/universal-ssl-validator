import { Device } from '../registry/device';
import { DeviceRegistry } from '../registry/device-registry';
import { logger } from '../../utils/logger';

export interface Fleet {
  id: string;
  name: string;
  tags: string[];
  devices: Device[];
  config: FleetConfig;
}

export interface FleetConfig {
  updatePolicy: UpdatePolicy;
  certRotation: RotationPolicy;
  monitoring: MonitoringConfig;
}

export interface UpdatePolicy {
  automatic: boolean;
  timeWindow?: {
    start: string; // HH:mm
    end: string;   // HH:mm
  };
  batchSize: number;
  failureThreshold: number;
}

export interface RotationPolicy {
  enabled: boolean;
  daysBeforeExpiry: number;
  staggered: boolean;
}

export interface MonitoringConfig {
  healthCheckInterval: number;
  metricsInterval: number;
  alertThresholds: {
    errorRate: number;
    latency: number;
  };
}

export class FleetManager {
  private fleets: Map<string, Fleet> = new Map();
  private registry: DeviceRegistry;

  constructor(registry: DeviceRegistry) {
    this.registry = registry;
  }

  async createFleet(fleet: Fleet): Promise<Fleet> {
    if (this.fleets.has(fleet.id)) {
      throw new Error(`Fleet ${fleet.id} already exists`);
    }

    this.fleets.set(fleet.id, fleet);
    logger.info('Fleet created', { fleetId: fleet.id });

    await this.setupFleetMonitoring(fleet);
    return fleet;
  }

  async addDeviceToFleet(fleetId: string, deviceId: string): Promise<void> {
    const fleet = this.fleets.get(fleetId);
    const device = this.registry.getDevice(deviceId);

    if (!fleet || !device) {
      throw new Error('Fleet or device not found');
    }

    if (fleet.devices.find(d => d.id === deviceId)) {
      throw new Error('Device already in fleet');
    }

    fleet.devices.push(device);
    logger.info('Device added to fleet', { fleetId, deviceId });
  }

  async updateFleetConfig(fleetId: string, config: Partial<FleetConfig>): Promise<void> {
    const fleet = this.fleets.get(fleetId);
    if (!fleet) {
      throw new Error('Fleet not found');
    }

    fleet.config = { ...fleet.config, ...config };
    await this.applyFleetConfig(fleet);
  }

  private async setupFleetMonitoring(fleet: Fleet): Promise<void> {
    const { healthCheckInterval, metricsInterval } = fleet.config.monitoring;

    setInterval(() => this.checkFleetHealth(fleet), healthCheckInterval);
    setInterval(() => this.collectFleetMetrics(fleet), metricsInterval);

    for (const device of fleet.devices) {
      device.on('cert-expiring', (days) => {
        if (fleet.config.certRotation.enabled && 
            days <= fleet.config.certRotation.daysBeforeExpiry) {
          this.rotateCertificate(device, fleet.config.certRotation);
        }
      });
    }
  }

  private async checkFleetHealth(fleet: Fleet): Promise<void> {
    const stats = {
      total: fleet.devices.length,
      connected: 0,
      error: 0,
      certValid: 0
    };

    for (const device of fleet.devices) {
      if (device.getStatus() === 'connected') stats.connected++;
      if (device.getStatus() === 'error') stats.error++;
      if (device.validateCertificate()) stats.certValid++;
    }

    if (stats.error / stats.total > fleet.config.monitoring.alertThresholds.errorRate) {
      logger.error('Fleet error rate above threshold', { 
        fleetId: fleet.id, 
        errorRate: stats.error / stats.total 
      });
    }

    logger.info('Fleet health check', { fleetId: fleet.id, stats });
  }

  private async collectFleetMetrics(fleet: Fleet): Promise<void> {
    const metrics = {
      devices_total: fleet.devices.length,
      devices_connected: fleet.devices.filter(d => d.getStatus() === 'connected').length,
      devices_error: fleet.devices.filter(d => d.getStatus() === 'error').length,
      certs_valid: fleet.devices.filter(d => d.validateCertificate()).length,
      avg_cert_days: fleet.devices.reduce((acc, d) => acc + d.certValidDays(), 0) / fleet.devices.length
    };

    // Push metrics here
    logger.info('Fleet metrics collected', { fleetId: fleet.id, metrics });
  }

  private async rotateCertificate(device: Device, policy: RotationPolicy): Promise<void> {
    try {
      // Implement certificate rotation logic here
      logger.info('Certificate rotation initiated', { deviceId: device.id });
    } catch (error) {
      logger.error('Certificate rotation failed', { deviceId: device.id, error });
    }
  }
}
