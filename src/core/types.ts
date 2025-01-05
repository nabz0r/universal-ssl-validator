export interface CertificateInfo {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  fingerprint: string;
  keyUsage: string[];
}

export interface OCSPResponse {
  status: 'good' | 'revoked' | 'unknown';
  producedAt: string;
  thisUpdate: string;
  nextUpdate?: string;
  revokedReason?: string;
}

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