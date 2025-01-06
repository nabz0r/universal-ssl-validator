import { X509Certificate } from 'crypto';
import { ValidationResult, CertificateInfo, OCSPResponse } from './types';
import { fetchCertificate, checkOCSP } from '../utils/network';
import { validateDates, validateKeyUsage, validateChain } from './checks';
import { isValidDomain, sanitizeDomain } from '../utils/validation';
import { logger } from '../utils/logger';

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
      // Input validation
      if (!isValidDomain(domain)) {
        throw new Error('INVALID_INPUT: Invalid domain format');
      }

      // Sanitize domain
      const sanitizedDomain = sanitizeDomain(domain);

      // Fetch certificate
      const cert = await fetchCertificate(sanitizedDomain);
      
      // Basic validation checks
      const certInfo = this.extractCertificateInfo(cert);
      const [dateValid, keyUsageValid, chainValid] = await Promise.all([
        validateDates(cert),
        validateKeyUsage(cert),
        validateChain(cert)
      ]);
      
      // OCSP validation if enabled
      let ocspStatus = null;
      if (this.options.checkOCSP) {
        ocspStatus = await this.performOCSPCheck(cert);
      }

      const result = {
        valid: dateValid && keyUsageValid && chainValid && (!ocspStatus || ocspStatus.status === 'good'),
        certInfo,
        dateValid,
        keyUsageValid,
        chainValid,
        ocspStatus,
        timestamp: new Date().toISOString(),
        error: null
      };

      // Log success
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
      // Log error
      logger.error('Certificate validation failed', {
        domain,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Return standardized error
      return {
        valid: false,
        certInfo: null,
        dateValid: false,
        keyUsageValid: false,
        chainValid: false,
        ocspStatus: null,
        timestamp: new Date().toISOString(),
        error: this.standardizeError(error)
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
      throw new Error('OCSP_ERROR: OCSP check failed');
    }
  }

  private standardizeError(error: unknown): string {
    if (error instanceof Error) {
      // Liste des préfixes d'erreur connus
      const knownPrefixes = ['INVALID_INPUT:', 'NETWORK_ERROR:', 'CERT_ERROR:', 'TIMEOUT_ERROR:', 'OCSP_ERROR:'];
      
      // Si l'erreur a déjà un préfixe connu, on la retourne
      if (knownPrefixes.some(prefix => error.message.startsWith(prefix))) {
        return error.message;
      }

      // Sinon on retourne une erreur générique
      return 'INTERNAL_ERROR: Certificate validation failed';
    }
    return 'UNKNOWN_ERROR: An unexpected error occurred';
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
  timeout: 5000,
  maxRetries: 3,
  cache: true,
  cacheExpiry: 3600
};