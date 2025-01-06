import { connect, MqttClient } from 'mqtt';
import { ProtocolAdapter, AdapterConfig, MessageHandler } from './protocol-adapter';
import { logger } from '../../utils/logger';

export class MQTTAdapter implements ProtocolAdapter {
  private client: MqttClient | null = null;
  private config: AdapterConfig;
  private subscriptions: Map<string, MessageHandler> = new Map();

  constructor(config: AdapterConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = `mqtt${this.config.tls ? 's' : ''}://${this.config.host}:${this.config.port}`;
      
      this.client = connect(url, {
        clientId: this.config.clientId,
        username: this.config.username,
        password: this.config.password,
        rejectUnauthorized: this.config.tls?.rejectUnauthorized,
        cert: this.config.tls?.cert,
        key: this.config.tls?.key,
        ca: this.config.tls?.ca,
        clean: true,
        keepalive: 60
      });

      this.client.on('connect', () => {
        logger.info('MQTT connected', { clientId: this.config.clientId });
        resolve();
      });

      this.client.on('error', (error) => {
        logger.error('MQTT error', { error });
        reject(error);
      });

      this.client.on('message', (topic, message) => {
        const handler = this.subscriptions.get(topic);
        if (handler) {
          try {
            handler(topic, JSON.parse(message.toString()));
          } catch (error) {
            logger.error('Message handler error', { topic, error });
          }
        }
      });
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.client) {
        resolve();
        return;
      }
      this.client.end(false, () => {
        this.client = null;
        resolve();
      });
    });
  }

  async subscribe(topic: string, handler: MessageHandler): Promise<void> {
    if (!this.client) throw new Error('Not connected');
    
    return new Promise((resolve, reject) => {
      this.client!.subscribe(topic, (error) => {
        if (error) {
          reject(error);
          return;
        }
        this.subscriptions.set(topic, handler);
        resolve();
      });
    });
  }

  async publish(topic: string, message: any): Promise<void> {
    if (!this.client) throw new Error('Not connected');
    
    return new Promise((resolve, reject) => {
      this.client!.publish(
        topic,
        JSON.stringify(message),
        { qos: 1, retain: false },
        (error) => {
          if (error) reject(error);
          else resolve();
        }
      );
    });
  }

  isConnected(): boolean {
    return this.client?.connected ?? false;
  }
}