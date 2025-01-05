import { X509Certificate } from 'crypto';

export function extractOCSPUrl(cert: X509Certificate): string | null {
  // Parse certificate extensions to find OCSP URL
  // Format: Authority Information Access extension with OCSP responder URL
  
  // TODO: Implement proper ASN.1 parsing of extensions
  // This is a placeholder implementation
  return null;
}

export function calculateCertificateHash(cert: X509Certificate, algorithm = 'sha256'): Buffer {
  // Calculate hash of the certificate using specified algorithm
  const crypto = require('crypto');
  const hash = crypto.createHash(algorithm);
  hash.update(cert.raw);
  return hash.digest();
}

export function extractSerialNumber(cert: X509Certificate): Buffer {
  // Extract serial number as Buffer
  return Buffer.from(cert.serialNumber, 'hex');
}
