import * as tf from '@tensorflow/tfjs';
import { Certificate } from '../types';

interface SecurityMetrics {
  expirationRisk: number;
  vulnerabilityRisk: number;
  issuerTrust: number;
  overallScore: number;
}

class PredictiveSecurityService {
  private model: tf.LayersModel | null = null;
  private readonly modelPath = 'models/security-predictor';

  constructor() {
    this.initModel();
  }

  private async initModel() {
    try {
      this.model = await tf.loadLayersModel(this.modelPath);
    } catch (error) {
      console.error('Error loading model:', error);
      throw error;
    }
  }

  private preprocessCertificate(cert: Certificate): tf.Tensor {
    // Convertir les données du certificat en tenseur
    const features = [
      this.normalizeDate(cert.notBefore),
      this.normalizeDate(cert.notAfter),
      this.encodeIssuer(cert.issuer),
      this.encodeAlgorithm(cert.algorithm),
      this.encodeKeyLength(cert.keyLength)
    ];
    return tf.tensor2d([features]);
  }

  private normalizeDate(date: Date): number {
    const now = new Date().getTime();
    const certDate = new Date(date).getTime();
    return (certDate - now) / (1000 * 60 * 60 * 24 * 365); // Années
  }

  private encodeIssuer(issuer: string): number {
    // Implémentation de l'encodage de l'émetteur
    const knownIssuers = new Map([
      ['Lets Encrypt', 1],
      ['DigiCert', 2],
      ['Sectigo', 3],
      // Ajouter d'autres émetteurs
    ]);
    return knownIssuers.get(issuer) || 0;
  }

  private encodeAlgorithm(algo: string): number {
    const algorithms = new Map([
      ['RSA', 1],
      ['ECDSA', 2],
      ['Ed25519', 3]
    ]);
    return algorithms.get(algo) || 0;
  }

  private encodeKeyLength(length: number): number {
    return length / 4096; // Normalisation
  }

  async predictRisks(cert: Certificate): Promise<SecurityMetrics> {
    if (!this.model) {
      throw new Error('Model not initialized');
    }

    const input = this.preprocessCertificate(cert);
    const prediction = this.model.predict(input) as tf.Tensor;
    const values = await prediction.array();

    return {
      expirationRisk: values[0][0],
      vulnerabilityRisk: values[0][1],
      issuerTrust: values[0][2],
      overallScore: values[0][3]
    };
  }

  async detectAnomalies(certs: Certificate[]): Promise<Certificate[]> {
    const anomalies = [];
    for (const cert of certs) {
      const metrics = await this.predictRisks(cert);
      if (metrics.overallScore < 0.7) {
        anomalies.push(cert);
      }
    }
    return anomalies;
  }

  async suggestImprovements(cert: Certificate): Promise<string[]> {
    const metrics = await this.predictRisks(cert);
    const suggestions = [];

    if (metrics.expirationRisk > 0.7) {
      suggestions.push('Renouvellement du certificat recommandé');
    }

    if (metrics.vulnerabilityRisk > 0.5) {
      suggestions.push('Mise à niveau de l\'algorithme de chiffrement conseillée');
    }

    if (metrics.issuerTrust < 0.8) {
      suggestions.push('Considérer un émetteur de certificat plus fiable');
    }

    return suggestions;
  }
}

export default PredictiveSecurityService;