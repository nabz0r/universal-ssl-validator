import { X509Certificate } from 'crypto';
import { ValidationResult, CertificateInfo, OCSPResponse, CTLogInfo } from './types';
import { fetchCertificate, checkOCSP } from '../utils/network';
import { validateDates, validateKeyUsage, validateChain } from './checks';
import { isValidDomain, sanitizeDomain } from '../utils/validation';
import { logger } from '../utils/logger';
import { verifyCTLogs } from './ct-verification';

export class SSLValidator {
  private readonly options: SSLValidatorOptions;

  constructor(options: SSLValidatorOptions = defaultOptions) {
    this.options = { 
      ...defaultOptions, 
      ...options,
      timeout: Math.min(Math.max(options.timeout || defaultOptions.timeout, 1000), 30000)
    };
  }

  async validateCertificate(domain: string): Promise<ValidationResult> {
    try {
      if (!isValidDomain(domain)) {
        throw new Error('INVALID_INPUT: Invalid domain format');
      }

      const sanitizedDomain = sanitizeDomain(domain);
      const cert = await fetchCertificate(sanitizedDomain);
      
      const certInfo = await this.extractCertificateInfo(cert);
      const [dateValid, keyUsageValid, chainValid] = await Promise.all([
        validateDates(cert),
        validateKeyUsage(cert),
        validateChain(cert)
      ]);
      
      let ocspStatus = null;
      if (this.options.checkOCSP) {
        ocspStatus = await this.performOCSPCheck(cert);
      }

      let ctValid = undefined;
      if (this.options.checkCT) {
        const ctLogs = await verifyCTLogs(cert);
        certInfo.ctLogs = ctLogs;
        ctValid = ctLogs.length > 0 && ctLogs.every(log => log.signatureValid);
      }

      const result = {
        valid: dateValid && keyUsageValid && chainValid && 
               (!ocspStatus || ocspStatus.status === 'good') &&
               (ctValid === undefined || ctValid),
        certInfo,
        dateValid,
        keyUsageValid,
        chainValid,
        ctValid,
        ocspStatus,
        timestamp: new Date().toISOString(),
        error: null
      };

      logger.info('Certificate validation completed', {
        domain: sanitizedDomain,
        valid: result.valid,
        certInfo: {
          subject: certInfo.subject,
          issuer: certInfo.issuer,
          validFrom: certInfo.validFrom,
          validTo: certInfo.validTo
        }
      });

      return result;

    } catch (error) {
      logger.error('Certificate validation failed', {
        domain,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        valid: false,
        certInfo: null,
        dateValid: false,
        keyUsageValid: false,
        chainValid: false,
        ctValid: false,
        ocspStatus: null,
        timestamp: new Date().toISOString(),
        error: this.standardizeError(error)
      };
    }
  }

  private async extractCertificateInfo(cert: X509Certificate): Promise<CertificateInfo> {
    const info = {
      subject: cert.subject,
      issuer: cert.issuer,
      validFrom: cert.validFrom,
      validTo: cert.validTo,
      serialNumber: cert.serialNumber,
      fingerprint: cert.fingerprint,
      keyUsage: cert.keyUsage,
      extendedKeyUsage: cert.extendedKeyUsage,
      subjectAltNames: [], // À extraire des extensions
      signatureAlgorithm: cert.sigAlgName,
      publicKeyInfo: {
        algorithm: cert.publicKey.asymmetricKeyType,
        size: cert.publicKey.asymmetricKeySize
      }
    };

    return info;
  }

  private async performOCSPCheck(cert: X509Certificate): Promise<OCSPResponse> {
    try {
      return await checkOCSP(cert);
    } catch (error) {
      throw new Error('OCSP_ERROR: OCSP check failed');
    }
  }

  private standardizeError(error: unknown): string {
    if (error instanceof Error) {
      const knownPrefixes = [
        'INVALID_INPUT:', 
        'NETWORK_ERROR:', 
        'CERT_ERROR:', 
        'TIMEOUT_ERROR:', 
        'OCSP_ERROR:',
        'CT_ERROR:'
      ];
      
      if (knownPrefixes.some(prefix => error.message.startsWith(prefix))) {
        return error.message;
      }

      return 'INTERNAL_ERROR: Certificate validation failed';
    }
    return 'UNKNOWN_ERROR: An unexpected error occurred';
  }
}

export interface SSLValidatorOptions {
  checkOCSP: boolean;
  checkCT: boolean;
  timeout: number;
  maxRetries: number;
  cache: boolean;
  cacheExpiry: number;
}

const defaultOptions: SSLValidatorOptions = {
  checkOCSP: true,
  checkCT: true,
  timeout: 5000,
  maxRetries: 3,
  cache: true,
  cacheExpiry: 3600
};