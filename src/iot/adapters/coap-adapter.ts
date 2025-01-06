import coap from 'coap';
import { ProtocolAdapter, AdapterConfig, MessageHandler } from './protocol-adapter';
import { logger } from '../../utils/logger';

export class CoAPAdapter implements ProtocolAdapter {
  private server: any;
  private client: any;
  private config: AdapterConfig;
  private subscriptions: Map<string, MessageHandler> = new Map();

  constructor(config: AdapterConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.client = new coap.Agent();

        this.server = coap.createServer({
          dtls: this.config.tls ? {
            cert: this.config.tls.cert,
            key: this.config.tls.key,
            ca: this.config.tls.ca
          } : undefined
        });

        this.server.on('request', (req: any, res: any) => {
          const topic = req.url;
          const handler = this.subscriptions.get(topic);
          
          if (handler) {
            try {
              const message = JSON.parse(req.payload.toString());
              handler(topic, message);
              res.end();
            } catch (error) {
              logger.error('CoAP message handler error', { topic, error });
              res.code = '4.00';
              res.end();
            }
          } else {
            res.code = '4.04';
            res.end();
          }
        });

        this.server.listen(this.config.port, () => {
          logger.info('CoAP server started', { port: this.config.port });
          resolve();
        });

      } catch (error) {
        reject(error);
      }
    });
  }

  async disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.server = null;
          this.client = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  async subscribe(topic: string, handler: MessageHandler): Promise<void> {
    this.subscriptions.set(topic, handler);
  }

  async publish(topic: string, message: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const req = this.client.request({
        host: this.config.host,
        port: this.config.port,
        method: 'POST',
        pathname: topic,
        options: {
          dtls: this.config.tls ? {
            cert: this.config.tls.cert,
            key: this.config.tls.key,
            ca: this.config.tls.ca
          } : undefined
        }
      });

      req.write(JSON.stringify(message));
      req.on('response', (res: any) => {
        const code = parseInt(res.code);
        if (code >= 400) {
          reject(new Error(`CoAP error: ${code}`));
        } else {
          resolve();
        }
      });

      req.on('error', reject);
      req.end();
    });
  }

  isConnected(): boolean {
    return this.server !== null;
  }
}