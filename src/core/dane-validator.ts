import { X509Certificate } from 'crypto';
import * as dns from 'dns';
import { promisify } from 'util';
import { createHash } from 'crypto';
import { logger } from '../utils/logger';

const resolveTlsa = promisify(dns.resolveTlsa);

interface TLSARecord {
  usage: number;
  selector: number;
  matchingType: number;
  certificate: string;
}

interface DANEValidationResult {
  valid: boolean;
  records: TLSARecord[];
  error?: string;
}

export async function validateDANE(
  domain: string,
  cert: X509Certificate
): Promise<DANEValidationResult> {
  try {
    const tlsaName = `_443._tcp.${domain}`;
    const records = await resolveTlsa(tlsaName);
    
    if (!records || records.length === 0) {
      return { 
        valid: false, 
        records: [],
        error: 'No TLSA records found'
      };
    }

    const validations = await Promise.all(records.map(record => 
      verifyTLSARecord(record, cert)
    ));

    const validRecord = records[validations.findIndex(v => v)];
    
    if (validRecord) {
      return {
        valid: true,
        records: [validRecord]
      };
    }

    return {
      valid: false,
      records,
      error: 'No matching TLSA record found'
    };

  } catch (error) {
    logger.error('DANE validation failed', { domain, error });
    return {
      valid: false,
      records: [],
      error: `DANE validation failed: ${error.message}`
    };
  }
}

async function verifyTLSARecord(
  record: TLSARecord, 
  cert: X509Certificate
): Promise<boolean> {
  try {
    switch (record.usage) {
      case 0: // PKIX-TA - CA constraint
        if (!await verifyCAConstraint(record, cert)) return false;
        break;
      case 1: // PKIX-EE - Service certificate constraint
        if (!await verifyServiceCertConstraint(record, cert)) return false;
        break;
      case 2: // DANE-TA - Trust anchor assertion
        if (!await verifyTrustAnchorAssertion(record, cert)) return false;
        break;
      case 3: // DANE-EE - Domain-issued certificate
        if (!await verifyDomainIssuedCert(record, cert)) return false;
        break;
      default:
        throw new Error(`Unsupported TLSA usage: ${record.usage}`);
    }

    let certData: Buffer;
    switch (record.selector) {
      case 0: // Full certificate
        certData = cert.raw;
        break;
      case 1: // SubjectPublicKeyInfo
        certData = cert.publicKey.export();
        break;
      default:
        throw new Error(`Unsupported selector: ${record.selector}`);
    }

    let hash: Buffer;
    switch (record.matchingType) {
      case 0: // Exact match
        hash = certData;
        break;
      case 1: // SHA-256
        hash = createHash('sha256').update(certData).digest();
        break;
      case 2: // SHA-512
        hash = createHash('sha512').update(certData).digest();
        break;
      default:
        throw new Error(`Unsupported matching type: ${record.matchingType}`);
    }

    const recordData = Buffer.from(record.certificate, 'hex');
    return hash.equals(recordData);

  } catch (error) {
    logger.error('TLSA record verification failed', { record, error });
    return false;
  }
}