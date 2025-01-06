import { Schema } from 'mongoose';

// MongoDB Schemas
export const deviceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  type: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['connected', 'disconnected', 'error'],
    default: 'disconnected'
  },
  certificate: {
    data: { type: Buffer, required: true },
    validFrom: { type: Date, required: true },
    validTo: { type: Date, required: true },
    fingerprint: { type: String, required: true }
  },
  fleet: { type: String, ref: 'Fleet' },
  metadata: { type: Map, of: Schema.Types.Mixed },
  lastSeen: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const fleetSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  tags: [String],
  config: {
    updatePolicy: {
      automatic: { type: Boolean, default: true },
      timeWindow: {
        start: String,
        end: String
      },
      batchSize: { type: Number, default: 10 },
      failureThreshold: { type: Number, default: 0.1 }
    },
    certRotation: {
      enabled: { type: Boolean, default: true },
      daysBeforeExpiry: { type: Number, default: 30 },
      staggered: { type: Boolean, default: true }
    },
    monitoring: {
      healthCheckInterval: { type: Number, default: 300000 },
      metricsInterval: { type: Number, default: 60000 },
      alertThresholds: {
        errorRate: { type: Number, default: 0.05 },
        latency: { type: Number, default: 1000 }
      }
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// TimescaleDB Schemas
export const metricsSchema = {
  // Validations
  validations: `
    CREATE TABLE validations (
      time TIMESTAMPTZ NOT NULL,
      domain TEXT NOT NULL,
      valid BOOLEAN,
      chain_valid BOOLEAN,
      ocsp_status TEXT,
      ct_valid BOOLEAN,
      dane_valid BOOLEAN,
      duration_ms INTEGER
    );
    SELECT create_hypertable('validations', 'time');
  `,

  // Device Metrics
  device_metrics: `
    CREATE TABLE device_metrics (
      time TIMESTAMPTZ NOT NULL,
      device_id TEXT NOT NULL,
      status TEXT,
      connected BOOLEAN,
      cert_days_remaining INTEGER,
      error_count INTEGER,
      latency_ms INTEGER
    );
    SELECT create_hypertable('device_metrics', 'time');
  `,

  // Fleet Metrics
  fleet_metrics: `
    CREATE TABLE fleet_metrics (
      time TIMESTAMPTZ NOT NULL,
      fleet_id TEXT NOT NULL,
      total_devices INTEGER,
      connected_devices INTEGER,
      error_rate FLOAT,
      avg_cert_days_remaining INTEGER,
      cert_rotations_pending INTEGER
    );
    SELECT create_hypertable('fleet_metrics', 'time');
  `
};

// Redis Schemas (cache keys)
export const redisKeys = {
  // Device Status Cache
  deviceStatus: (deviceId: string) => `device:${deviceId}:status`,
  deviceLastSeen: (deviceId: string) => `device:${deviceId}:lastSeen`,

  // Certificate Cache
  certValidation: (domain: string) => `cert:${domain}:validation`,
  certOCSP: (domain: string) => `cert:${domain}:ocsp`,

  // Fleet Cache
  fleetDevices: (fleetId: string) => `fleet:${fleetId}:devices`,
  fleetMetrics: (fleetId: string) => `fleet:${fleetId}:metrics`,

  // Rate Limiting
  rateLimit: (key: string) => `ratelimit:${key}`
};