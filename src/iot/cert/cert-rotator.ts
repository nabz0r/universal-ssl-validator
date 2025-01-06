import { Device } from '../registry/device';
import { X509Certificate } from 'crypto';
import { logger } from '../../utils/logger';
import { generateKeyPair, createCertificate } from './cert-generator';

export interface RotationConfig {
  staggered: boolean;
  daysBeforeExpiry: number;
  validityPeriod: number; // en jours
  renewalBatchSize: number;
  renewalWindow: {
    start: string; // HH:mm
    end: string;   // HH:mm
  };
}

export class CertificateRotator {
  private rotationQueue: Map<string, Device> = new Map();
  private config: RotationConfig;

  constructor(config: RotationConfig) {
    this.config = config;
    this.startRotationScheduler();
  }

  async queueRotation(device: Device): Promise<void> {
    if (this.rotationQueue.has(device.id)) return;
    
    const daysRemaining = device.certValidDays();
    if (daysRemaining <= this.config.daysBeforeExpiry) {
      this.rotationQueue.set(device.id, device);
      logger.info('Device queued for certificate rotation', { deviceId: device.id, daysRemaining });
    }
  }

  private async startRotationScheduler(): Promise<void> {
    setInterval(() => this.processRotationQueue(), 5 * 60 * 1000); // Check every 5min
  }

  private isWithinWindow(): boolean {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    return currentTime >= this.config.renewalWindow.start && currentTime <= this.config.renewalWindow.end;
  }

  private async processRotationQueue(): Promise<void> {
    if (!this.isWithinWindow() || this.rotationQueue.size === 0) return;

    const devices = Array.from(this.rotationQueue.values())
      .slice(0, this.config.renewalBatchSize);

    for (const device of devices) {
      try {
        const newCert = await this.rotateCertificate(device);
        if (newCert) {
          device.updateCertificate(newCert);
          this.rotationQueue.delete(device.id);
          logger.info('Certificate rotated successfully', { deviceId: device.id });
        }
      } catch (error) {
        logger.error('Certificate rotation failed', { deviceId: device.id, error });
      }
    }
  }

  private async rotateCertificate(device: Device): Promise<X509Certificate> {
    // Générer nouvelle paire de clés
    const { privateKey, publicKey } = await generateKeyPair();

    // Créer nouveau certificat
    const certInfo = {
      commonName: device.id,
      organization: 'Universal SSL Validator',
      validityDays: this.config.validityPeriod,
      type: device.type,
    };

    const newCert = await createCertificate(certInfo, privateKey, publicKey);
    return newCert;
  }
}