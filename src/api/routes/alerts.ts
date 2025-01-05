import express from 'express';
import { TimescaleDB } from '../../db/timescale';
import { MongoDB } from '../../db/mongo';

const router = express.Router();
const timescaleDb = TimescaleDB.getInstance();
const mongoDb = MongoDB.getInstance();

// Récupération des alertes actives
router.get('/active', async (req, res) => {
  try {
    const alerts = await mongoDb.getCollection('alerts')
      .find({ status: 'active' })
      .sort({ timestamp: -1 })
      .toArray();

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching active alerts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Historique des alertes avec filtrage
router.get('/history', async (req, res) => {
  try {
    const { severity, service, status, dateFrom, dateTo, search } = req.query;
    
    let query: any = {};

    if (severity !== 'all') query.severity = severity;
    if (service !== 'all') query.service = service;
    if (status !== 'all') query.status = status;
    if (dateFrom || dateTo) {
      query.timestamp = {};
      if (dateFrom) query.timestamp.$gte = new Date(dateFrom as string);
      if (dateTo) query.timestamp.$lte = new Date(dateTo as string);
    }
    if (search) {
      query.$or = [
        { message: new RegExp(search as string, 'i') },
        { service: new RegExp(search as string, 'i') }
      ];
    }

    const alerts = await mongoDb.getCollection('alerts')
      .find(query)
      .sort({ timestamp: -1 })
      .toArray();

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alert history:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Création d'une alerte
router.post('/', async (req, res) => {
  try {
    const { severity, message, service } = req.body;

    const alert = {
      severity,
      message,
      service,
      timestamp: new Date(),
      status: 'active'
    };

    await mongoDb.getCollection('alerts').insertOne(alert);
    res.status(201).json(alert);
  } catch (error) {
    console.error('Error creating alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Résolution d'une alerte
router.put('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await mongoDb.getCollection('alerts').updateOne(
      { _id: id },
      {
        $set: {
          status: 'resolved',
          resolvedAt: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ error: 'Alert not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;