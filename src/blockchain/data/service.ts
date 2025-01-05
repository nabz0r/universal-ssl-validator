import { TimescaleDB } from '../../db/timescale';
import { MongoDB } from '../../db/mongo';
import { RedisCache } from '../../db/redis';

class BlockchainDataService {
  private timescaleDb: TimescaleDB;
  private mongoDb: MongoDB;
  private cache: RedisCache;

  constructor() {
    this.timescaleDb = TimescaleDB.getInstance();
    this.mongoDb = MongoDB.getInstance();
    this.cache = RedisCache.getInstance();
  }

  async storeTransaction(transaction: any): Promise<void> {
    // Stockage dans MongoDB
    await this.mongoDb.getCollection('blockchain_transactions').insertOne({
      ...transaction,
      timestamp: new Date()
    });

    // Stockage des métriques dans TimescaleDB
    await this.timescaleDb.query(`
      INSERT INTO blockchain_metrics (
        transaction_hash,
        chain_id,
        gas_used,
        confirmation_time,
        status,
        timestamp
      ) VALUES ($1, $2, $3, $4, $5, NOW())
    `, [
      transaction.hash,
      transaction.chainId,
      transaction.gasUsed,
      transaction.confirmationTime,
      transaction.status
    ]);

    // Mise à jour du cache
    await this.cache.setTransactionStatus(
      transaction.hash,
      transaction.status
    );
  }

  async getTransactionStatus(hash: string): Promise<string> {
    // Vérifier le cache
    const cached = await this.cache.getTransactionStatus(hash);
    if (cached) {
      return cached;
    }

    // Récupérer de MongoDB
    const tx = await this.mongoDb
      .getCollection('blockchain_transactions')
      .findOne({ hash });

    if (tx) {
      await this.cache.setTransactionStatus(hash, tx.status);
      return tx.status;
    }

    return 'unknown';
  }

  async storeCrossChainValidation(validationData: any): Promise<void> {
    // Stockage dans MongoDB
    await this.mongoDb.getCollection('cross_chain_validations').insertOne({
      ...validationData,
      timestamp: new Date()
    });

    // Métriques dans TimescaleDB
    await this.timescaleDb.query(`
      INSERT INTO validation_metrics (
        certificate_id,
        source_chain,
        target_chain,
        validation_time,
        success,
        timestamp
      ) VALUES ($1, $2, $3, $4, $5, NOW())
    `, [
      validationData.certificateId,
      validationData.sourceChain,
      validationData.targetChain,
      validationData.validationTime,
      validationData.success
    ]);

    // Cache du résultat
    const cacheKey = `validation:${validationData.certificateId}:${validationData.sourceChain}:${validationData.targetChain}`;
    await this.cache.set(cacheKey, validationData.success, 300);
  }

  async getValidationMetrics(timeRange: string): Promise<any[]> {
    return await this.timescaleDb.query(`
      SELECT 
        time_bucket('1 hour', timestamp) AS hour,
        source_chain,
        target_chain,
        COUNT(*) as validation_count,
        AVG(validation_time) as avg_validation_time,
        SUM(CASE WHEN success THEN 1 ELSE 0 END)::float / COUNT(*) as success_rate
      FROM validation_metrics
      WHERE timestamp > NOW() - INTERVAL '${timeRange}'
      GROUP BY hour, source_chain, target_chain
      ORDER BY hour DESC
    `);
  }

  async getChainPerformance(chainId: string, timeRange: string): Promise<any> {
    // Récupérer les métriques de performance
    const metrics = await this.timescaleDb.query(`
      SELECT 
        time_bucket('5 minutes', timestamp) AS interval,
        AVG(gas_used) as avg_gas,
        AVG(confirmation_time) as avg_confirmation_time,
        COUNT(*) as tx_count
      FROM blockchain_metrics
      WHERE chain_id = $1
      AND timestamp > NOW() - INTERVAL '${timeRange}'
      GROUP BY interval
      ORDER BY interval DESC
    `, [chainId]);

    // Stockage dans le cache
    const cacheKey = `chain_performance:${chainId}`;
    await this.cache.set(cacheKey, JSON.stringify(metrics), 300);

    return metrics;
  }

  async storeValidatorMetrics(validatorData: any): Promise<void> {
    // Stockage dans MongoDB
    await this.mongoDb.getCollection('validator_metrics').insertOne({
      ...validatorData,
      timestamp: new Date()
    });

    // Métriques dans TimescaleDB
    await this.timescaleDb.query(`
      INSERT INTO validator_performance (
        validator_address,
        chain_id,
        validations_count,
        success_rate,
        response_time,
        timestamp
      ) VALUES ($1, $2, $3, $4, $5, NOW())
    `, [
      validatorData.address,
      validatorData.chainId,
      validatorData.validationsCount,
      validatorData.successRate,
      validatorData.responseTime
    ]);
  }
}

export default BlockchainDataService;