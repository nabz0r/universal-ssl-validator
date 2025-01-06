import { DatabaseManager } from '../index';

export class MetricsRepository {
  private timescaleClient;

  constructor() {
    const dbManager = DatabaseManager.getInstance();
    this.timescaleClient = dbManager.getTimescale();
  }

  async recordValidation(validation: any) {
    const query = `
      INSERT INTO validations (
        time, domain, valid, chain_valid, ocsp_status,
        ct_valid, dane_valid, duration_ms
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    const values = [
      new Date(),
      validation.domain,
      validation.valid,
      validation.chainValid,
      validation.ocspStatus,
      validation.ctValid,
      validation.daneValid,
      validation.duration
    ];

    await this.timescaleClient.query(query, values);
  }

  async recordDeviceMetrics(metrics: any) {
    const query = `
      INSERT INTO device_metrics (
        time, device_id, status, connected,
        cert_days_remaining, error_count, latency_ms
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    const values = [
      new Date(),
      metrics.deviceId,
      metrics.status,
      metrics.connected,
      metrics.certDaysRemaining,
      metrics.errorCount,
      metrics.latency
    ];

    await this.timescaleClient.query(query, values);
  }

  async recordFleetMetrics(metrics: any) {
    const query = `
      INSERT INTO fleet_metrics (
        time, fleet_id, total_devices, connected_devices,
        error_rate, avg_cert_days_remaining, cert_rotations_pending
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;
    const values = [
      new Date(),
      metrics.fleetId,
      metrics.totalDevices,
      metrics.connectedDevices,
      metrics.errorRate,
      metrics.avgCertDaysRemaining,
      metrics.certRotationsPending
    ];

    await this.timescaleClient.query(query, values);
  }

  async getValidationStats(domain: string, period: string = '7d') {
    const query = `
      SELECT 
        time_bucket('1h', time) as bucket,
        count(*) as total,
        sum(case when valid then 1 else 0 end)::float / count(*) as success_rate,
        avg(duration_ms) as avg_duration
      FROM validations
      WHERE domain = $1
        AND time > NOW() - INTERVAL '${period}'
      GROUP BY bucket
      ORDER BY bucket DESC
    `;

    return this.timescaleClient.query(query, [domain]);
  }
}