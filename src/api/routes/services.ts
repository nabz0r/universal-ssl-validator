import express from 'express';
import { TimescaleDB } from '../../db/timescale';
import { MongoDB } from '../../db/mongo';

const router = express.Router();
const timescaleDb = TimescaleDB.getInstance();
const mongoDb = MongoDB.getInstance();

// Récupération des détails d'un service
router.get('/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Récupération des infos du service
    const service = await mongoDb.getCollection('services').findOne({ _id: serviceId });
    if (!service) {
      return res.status(404).json({ error: 'Service not found' });
    }

    // Récupération des métriques récentes
    const metrics = await timescaleDb.query(`
      SELECT 
        AVG(response_time) as latency,
        COUNT(*) / EXTRACT(EPOCH FROM (MAX(timestamp) - MIN(timestamp))) * 60 as requests_per_minute,
        COUNT(CASE WHEN status = 'success' THEN 1 END)::float / COUNT(*) * 100 as success_rate
      FROM service_metrics
      WHERE service_id = $1
      AND timestamp > NOW() - INTERVAL '5 minutes'
    `, [serviceId]);

    res.json({
      ...service,
      latency: Math.round(metrics[0].latency),
      requestsPerMinute: Math.round(metrics[0].requests_per_minute),
      successRate: Math.round(metrics[0].success_rate)
    });
  } catch (error) {
    console.error('Error fetching service details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Récupération des métriques d'un service
router.get('/:serviceId/metrics', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { period = '1h' } = req.query;

    const metrics = await timescaleDb.query(`
      SELECT 
        time_bucket('1 minute', timestamp) AS timestamp,
        AVG(response_time) as latency,
        COUNT(*) as requests
      FROM service_metrics
      WHERE service_id = $1
      AND timestamp > NOW() - INTERVAL '${period}'
      GROUP BY timestamp
      ORDER BY timestamp ASC
    `, [serviceId]);

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching service metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Récupération des logs d'un service
router.get('/:serviceId/logs', async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { limit = 100 } = req.query;

    const logs = await mongoDb.getCollection('logs')
      .find({ service_id: serviceId })
      .sort({ timestamp: -1 })
      .limit(Number(limit))
      .toArray();

    res.json(logs);
  } catch (error) {
    console.error('Error fetching service logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;