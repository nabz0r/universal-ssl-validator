import express from 'express';
import { TimescaleDB } from '../../db/timescale';
import { MongoDB } from '../../db/mongo';

const router = express.Router();
const timescaleDb = TimescaleDB.getInstance();
const mongoDb = MongoDB.getInstance();

router.get('/overview', async (req, res) => {
  try {
    // Récupération des métriques principales
    const [certificateCount, validationMetrics, serviceStatus] = await Promise.all([
      // Nombre de certificats actifs
      mongoDb.getCollection('certificates').countDocuments({ status: 'valid' }),

      // Métriques de validation
      timescaleDb.query(`
        SELECT 
          COUNT(*) as total_validations,
          AVG(response_time) as avg_response_time,
          COUNT(*) / EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp))) * 60 as validations_per_minute
        FROM certificate_metrics
        WHERE timestamp > NOW() - INTERVAL '1 hour'
      `),

      // Statut des services
      timescaleDb.query(`
        SELECT 
          service_name,
          status,
          response_time as latency,
          timestamp
        FROM service_status
        WHERE timestamp > NOW() - INTERVAL '5 minutes'
        GROUP BY service_name
        ORDER BY timestamp DESC
      `)
    ]);

    // Historique des validations
    const validationHistory = await timescaleDb.query(`
      SELECT 
        time_bucket('5 minutes', timestamp) AS interval,
        COUNT(*) as count
      FROM certificate_metrics
      WHERE timestamp > NOW() - INTERVAL '24 hours'
      GROUP BY interval
      ORDER BY interval
    `);

    // Distribution des types de certificats
    const certificateTypes = await mongoDb.getCollection('certificates').aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]).toArray();

    res.json({
      activeCertificates: certificateCount,
      validationsPerMinute: Math.round(validationMetrics[0].validations_per_minute),
      avgResponseTime: Math.round(validationMetrics[0].avg_response_time),
      systemHealth: calculateSystemHealth(serviceStatus),
      validationHistory,
      certificateTypes,
      services: formatServiceStatus(serviceStatus)
    });

  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function calculateSystemHealth(services: any[]): number {
  if (!services.length) return 0;
  const upServices = services.filter(s => s.status === 'up').length;
  return Math.round((upServices / services.length) * 100);
}

function formatServiceStatus(statusData: any[]) {
  return statusData.map(s => ({
    name: s.service_name,
    status: s.status,
    latency: Math.round(s.latency)
  }));
}

export default router;