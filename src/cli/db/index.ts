import { MongoClient } from 'mongodb';
import { Client as TimescaleClient } from '@timescale/ts-client';
import { createClient } from 'redis';
import { logger } from '../../utils/logger';

export class DatabaseManager {
  private static instance: DatabaseManager;
  private mongoClient?: MongoClient;
  private timescaleClient?: TimescaleClient;
  private redisClient?: ReturnType<typeof createClient>;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async connect(config: DBConfig): Promise<void> {
    try {
      // MongoDB pour les données structurées (devices, flottes)
      this.mongoClient = await MongoClient.connect(config.mongodb.uri);
      
      // TimescaleDB pour les métriques temporelles
      this.timescaleClient = new TimescaleClient({
        url: config.timescale.url,
        username: config.timescale.username,
        password: config.timescale.password
      });
      await this.timescaleClient.connect();

      // Redis pour le cache et les sessions
      this.redisClient = createClient({
        url: config.redis.url,
        password: config.redis.password
      });
      await this.redisClient.connect();

      logger.info('Database connections established');
    } catch (error) {
      logger.error('Failed to connect to databases', { error });
      throw error;
    }
  }

  getMongo(): MongoClient {
    if (!this.mongoClient) throw new Error('MongoDB not connected');
    return this.mongoClient;
  }

  getTimescale(): TimescaleClient {
    if (!this.timescaleClient) throw new Error('TimescaleDB not connected');
    return this.timescaleClient;
  }

  getRedis(): ReturnType<typeof createClient> {
    if (!this.redisClient) throw new Error('Redis not connected');
    return this.redisClient;
  }

  async disconnect(): Promise<void> {
    await Promise.all([
      this.mongoClient?.close(),
      this.timescaleClient?.disconnect(),
      this.redisClient?.disconnect()
    ]);
  }
}

export interface DBConfig {
  mongodb: {
    uri: string;
  };
  timescale: {
    url: string;
    username: string;
    password: string;
  };
  redis: {
    url: string;
    password?: string;
  };
}