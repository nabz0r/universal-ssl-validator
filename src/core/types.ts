import { X509Certificate } from 'crypto';

export interface ValidationResult {
  valid: boolean;
  certInfo: CertificateInfo | null;
  dateValid: boolean;
  keyUsageValid: boolean;
  chainValid: boolean;
  ocspStatus: OCSPResponse | null;
  timestamp: string;
  error: string | null;
}

export interface CertificateInfo {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  fingerprint: string;
  keyUsage?: string[];
  extendedKeyUsage?: string[];
  subjectAltNames?: string[];
  signatureAlgorithm?: string;
  publicKeyInfo?: {
    algorithm: string;
    size: number;
  };
}

export interface OCSPResponse {
  status: 'good' | 'revoked' | 'unknown';
  revokedReason?: string;
  revokedAt?: string;
  thisUpdate: string;
  nextUpdate?: string;
}

export interface SSLValidatorOptions {
  checkOCSP: boolean;
  timeout: number;
  maxRetries: number;
  cache: boolean;
  cacheExpiry: number;
  minKeySize?: number;
  allowedAlgorithms?: string[];
  requiredKeyUsage?: string[];
  securityLevel?: 'basic' | 'standard' | 'high';
  monitoring?: boolean;
}

export interface ValidationError extends Error {
  code: string;
  details?: any;
}

export interface CertificateChain {
  leaf: X509Certificate;
  intermediates: X509Certificate[];
  root: X509Certificate;
}

export interface ValidationContext {
  domain: string;
  options: SSLValidatorOptions;
  chain?: CertificateChain;
  ocspResponders?: string[];
  startTime: number;
}
