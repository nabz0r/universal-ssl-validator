import { X509Certificate } from 'crypto';
import { ValidationResult, CertificateInfo, OCSPResponse } from './types';
import { fetchCertificate, checkOCSP } from '../utils/network';
import { validateDates, validateKeyUsage, validateChain } from './checks';

export class SSLValidator {
  private readonly options: SSLValidatorOptions;

  constructor(options: SSLValidatorOptions = defaultOptions) {
    this.options = { ...defaultOptions, ...options };
  }

  async validateCertificate(domain: string): Promise<ValidationResult> {
    try {
      // Fetch certificate
      const cert = await fetchCertificate(domain);
      
      // Basic validation checks
      const certInfo = this.extractCertificateInfo(cert);
      const dateValid = validateDates(cert);
      const keyUsageValid = validateKeyUsage(cert);
      const chainValid = await validateChain(cert);
      
      // OCSP validation if enabled
      let ocspStatus = null;
      if (this.options.checkOCSP) {
        ocspStatus = await this.performOCSPCheck(cert);
      }

      return {
        valid: dateValid && keyUsageValid && chainValid && (!ocspStatus || ocspStatus.status === 'good'),
        certInfo,
        dateValid,
        keyUsageValid,
        chainValid,
        ocspStatus,
        timestamp: new Date().toISOString(),
        error: null
      };
    } catch (error) {
      return {
        valid: false,
        certInfo: null,
        dateValid: false,
        keyUsageValid: false,
        chainValid: false,
        ocspStatus: null,
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private extractCertificateInfo(cert: X509Certificate): CertificateInfo {
    return {
      subject: cert.subject,
      issuer: cert.issuer,
      validFrom: cert.validFrom,
      validTo: cert.validTo,
      serialNumber: cert.serialNumber,
      fingerprint: cert.fingerprint,
      keyUsage: cert.keyUsage
    };
  }

  private async performOCSPCheck(cert: X509Certificate): Promise<OCSPResponse> {
    try {
      return await checkOCSP(cert);
    } catch (error) {
      throw new Error(`OCSP check failed: ${error.message}`);
    }
  }
}

export interface SSLValidatorOptions {
  checkOCSP: boolean;
  timeout: number;
  maxRetries: number;
  cache: boolean;
  cacheExpiry: number;
}

const defaultOptions: SSLValidatorOptions = {
  checkOCSP: true,
  timeout: 10000,
  maxRetries: 3,
  cache: true,
  cacheExpiry: 3600
};