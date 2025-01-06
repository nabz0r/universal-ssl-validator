import { EventEmitter } from 'events';
import { X509Certificate } from 'crypto';
import { logger } from '../../utils/logger';

export interface DeviceConfig {
  id: string;
  type: string;
  protocols: string[];
  certificates: {
    device: string;
    ca?: string;
  };
  metadata?: Record<string, any>;
}

export class Device extends EventEmitter {
  public readonly id: string;
  public readonly type: string;
  private protocols: string[];
  private certificates: {
    device: X509Certificate;
    ca?: X509Certificate;
  };
  private status: DeviceStatus = 'disconnected';
  private lastSeen?: Date;
  private metadata: Record<string, any>;

  constructor(config: DeviceConfig) {
    super();
    this.id = config.id;
    this.type = config.type;
    this.protocols = config.protocols;
    this.certificates = {
      device: new X509Certificate(config.certificates.device),
      ca: config.certificates.ca ? new X509Certificate(config.certificates.ca) : undefined
    };
    this.metadata = config.metadata || {};
  }

  public getStatus(): DeviceStatus {
    return this.status;
  }

  public updateStatus(status: DeviceStatus): void {
    const oldStatus = this.status;
    this.status = status;
    this.lastSeen = new Date();

    if (oldStatus !== status) {
      logger.info('Device status changed', { 
        deviceId: this.id, 
        oldStatus, 
        newStatus: status 
      });
      
      this.emit('status', status);
    }
  }

  public certValidDays(): number {
    const now = new Date();
    const expiry = new Date(this.certificates.device.validTo);
    const days = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (days <= 30) {
      this.emit('cert-expiring', days);
    }

    return days;
  }

  public validateCertificate(): boolean {
    const now = new Date();
    const cert = this.certificates.device;
    
    if (this.certificates.ca) {
      if (!cert.verify(this.certificates.ca.publicKey)) {
        return false;
      }
    }

    return now >= new Date(cert.validFrom) && now <= new Date(cert.validTo);
  }

  public getMetadata(): Record<string, any> {
    return { ...this.metadata };
  }

  public updateMetadata(metadata: Record<string, any>): void {
    this.metadata = { ...this.metadata, ...metadata };
    this.emit('metadata', this.metadata);
  }
}

export type DeviceStatus = 'connected' | 'disconnected' | 'error';