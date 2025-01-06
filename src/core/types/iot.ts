export interface Device {
  id: string;
  type: string;
  status: DeviceStatus;
  certificate: DeviceCertificate;
  fleet?: string;
  metadata?: Record<string, any>;
  lastSeen?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type DeviceStatus = 'connected' | 'disconnected' | 'error';

export interface DeviceCertificate {
  data: Buffer;
  validFrom: Date;
  validTo: Date;
  fingerprint: string;
}

export interface Fleet {
  id: string;
  name: string;
  tags: string[];
  config: FleetConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface FleetConfig {
  updatePolicy: UpdatePolicy;
  certRotation: RotationPolicy;
  monitoring: MonitoringConfig;
}

export interface UpdatePolicy {
  automatic: boolean;
  timeWindow?: {
    start: string;
    end: string;
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

export interface DeviceMetrics {
  deviceId: string;
  status: DeviceStatus;
  connected: boolean;
  certDaysRemaining: number;
  errorCount: number;
  latency: number;
  timestamp: Date;
}

export interface FleetMetrics {
  fleetId: string;
  totalDevices: number;
  connectedDevices: number;
  errorRate: number;
  avgCertDaysRemaining: number;
  certRotationsPending: number;
  timestamp: Date;
}