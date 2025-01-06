import { X509Certificate } from 'crypto';
import { CTLogInfo, SCTData } from './types';
import { logger } from '../utils/logger';
import { createHash, verify } from 'crypto';

interface CTLog {
  url: string;
  key: string;
  operator: string;
}

const KNOWN_CT_LOGS: CTLog[] = [
  {
    url: 'ct.googleapis.com/logs/argon2023/',
    key: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE0JCPZFJOQqyEti5M8j13ALN3CAVHqkVM4yyOcKWCu2yye5yYeqDpEXYoALIgtM3TmHtNlifmt+4iatGwLpF3eA==',
    operator: 'Google'
  },
  {
    url: 'ct.cloudflare.com/logs/nimbus2023/',
    key: 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEi/8tkhjLRp0SXrlZdTzNkTd6HqmcmXiDJz3fAdWLgOhjmv4mohvRhwXul9bgW0ODZf/TZbOPkjHY9FLK5pkpwg==',
    operator: 'Cloudflare'
  }
];

export async function verifyCTLogs(cert: X509Certificate): Promise<CTLogInfo[]> {
  try {
    const scts = extractSCTs(cert);
    
    if (!scts || scts.length === 0) {
      logger.warn('No SCTs found in certificate');
      return [];
    }

    const verifiedLogs: CTLogInfo[] = [];

    for (const sct of scts) {
      const log = KNOWN_CT_LOGS.find(l => l.key === sct.logId);
      if (log) {
        const isValid = await verifySignature(sct, cert, log.key);
        verifiedLogs.push({
          logOperator: log.operator,
          timestamp: new Date(sct.timestamp).toISOString(),
          signatureValid: isValid
        });
      }
    }

    return verifiedLogs;

  } catch (error) {
    logger.error('CT verification failed', { error });
    throw new Error('CT_ERROR: Failed to verify Certificate Transparency logs');
  }
}

function extractSCTs(cert: X509Certificate): SCTData[] {
  const SCT_EXTENSION_OID = '1.3.6.1.4.1.11129.2.4.2';
  const sctExtension = cert.raw.slice(cert.raw.indexOf(Buffer.from(SCT_EXTENSION_OID)));
  
  if (!sctExtension) {
    return [];
  }

  const scts: SCTData[] = [];
  let offset = 0;

  while (offset < sctExtension.length) {
    const length = sctExtension.readUInt16BE(offset);
    offset += 2;

    if (offset + length > sctExtension.length) break;

    const sctData = sctExtension.slice(offset, offset + length);
    offset += length;

    scts.push({
      version: sctData.readUInt8(0),
      logId: sctData.slice(1, 33).toString('base64'),
      timestamp: sctData.readBigUInt64BE(33),
      extensions: sctData.slice(41, 43),
      signature: sctData.slice(43)
    });
  }

  return scts;
}

async function verifySignature(
  sct: SCTData, 
  cert: X509Certificate,
  logKey: string
): Promise<boolean> {
  try {
    const tbsData = Buffer.concat([
      Buffer.from([0]), // Version
      Buffer.from('1.3.6.1.4.1.11129.2.4.2'), // SignatureType
      Buffer.from(sct.timestamp.toString(16), 'hex'),
      Buffer.from([0, 0]), // Extensions length
      cert.raw
    ]);

    const logKeyBuffer = Buffer.from(logKey, 'base64');
    return verify(
      'sha256',
      tbsData,
      {
        key: logKeyBuffer,
        padding: crypto.constants.RSA_PKCS1_PADDING
      },
      sct.signature
    );

  } catch (error) {
    logger.error('Signature verification failed', { error });
    return false;
  }
}
