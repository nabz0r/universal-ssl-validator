import { X509Certificate } from 'crypto';
import * as tls from 'tls';
import * as https from 'https';
import * as asn1 from 'asn1.js';
import { CertificateChain, OCSPResponse } from '../core/types';
import { logger } from './logger';

const OCSPRequest = asn1.define('OCSPRequest', function() {
  this.seq().obj(
    this.key('tbsRequest').seq().obj(
      this.key('version').explicit(0).int().optional(),
      this.key('requestList').seqof(this.key('request').seq().obj(
        this.key('reqCert').seq().obj(
          this.key('hashAlgorithm').seq().obj(
            this.key('algorithm').objid(),
            this.key('parameters').null_()
          ),
          this.key('issuerNameHash').octstr(),
          this.key('issuerKeyHash').octstr(),
          this.key('serialNumber').int()
        )
      ))
    )
  );
});

export async function fetchCertificate(
  domain: string, 
  options: { timeout: number; maxRetries: number; }
): Promise<CertificateChain> {
  let lastError: Error | null = null;
  let retries = 0;

  while (retries < options.maxRetries) {
    try {
      return await new Promise((resolve, reject) => {
        const socket = tls.connect({
          host: domain,
          port: 443,
          timeout: options.timeout,
          minVersion: 'TLSv1.2',
          rejectUnauthorized: true
        }, () => {
          try {
            const cert = socket.getPeerCertificate(true);
            const chain: CertificateChain = {
              leaf: new X509Certificate(cert.raw),
              intermediates: cert.issuerCertificate ? 
                [new X509Certificate(cert.issuerCertificate.raw)] : [],
              root: cert.issuerCertificate?.issuerCertificate ? 
                new X509Certificate(cert.issuerCertificate.issuerCertificate.raw) :
                null
            };
            socket.end();
            resolve(chain);
          } catch (error) {
            reject(new Error(`NETWORK_ERROR: Failed to fetch certificate: ${error.message}`));
          }
        });

        socket.on('error', (error) => {
          reject(new Error(`NETWORK_ERROR: Connection failed: ${error.message}`));
        });

        socket.on('timeout', () => {
          socket.destroy();
          reject(new Error('TIMEOUT_ERROR: Connection timed out'));
        });
      });
    } catch (error) {
      lastError = error;
      retries++;
      await new Promise(resolve => setTimeout(resolve, 1000 * retries));
    }
  }

  throw lastError || new Error('NETWORK_ERROR: Max retries reached');
}

async function fetchOCSPResponse(url: string, request: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/ocsp-request',
        'Content-Length': request.length.toString()
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`OCSP_ERROR: Invalid response status: ${res.statusCode}`));
        return;
      }

      const chunks: Buffer[] = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });

    req.on('error', reject);
    req.write(request);
    req.end();
  });
}

export async function checkOCSP(cert: X509Certificate): Promise<OCSPResponse> {
  try {
    const ocspUrl = cert.infoAccess['OCSP - URI'];
    if (!ocspUrl) {
      throw new Error('No OCSP responder URL found');
    }

    // Création de la requête OCSP
    const issuerCert = cert.issuer;
    const request = OCSPRequest.encode({
      tbsRequest: {
        requestList: [{
          reqCert: {
            hashAlgorithm: {
              algorithm: [2, 16, 840, 1, 101, 3, 4, 2, 1], // SHA-256
              parameters: null
            },
            issuerNameHash: createHash('sha256').update(issuerCert.raw).digest(),
            issuerKeyHash: createHash('sha256').update(issuerCert.publicKey.export()).digest(),
            serialNumber: cert.serialNumber
          }
        }]
      }
    }, 'der');

    // Envoi de la requête et traitement de la réponse
    const responseData = await fetchOCSPResponse(ocspUrl, request);
    
    const status = responseData[6];
    
    return {
      status: status === 0 ? 'good' : status === 1 ? 'revoked' : 'unknown',
      thisUpdate: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      revocationTime: status === 1 ? new Date(responseData.readBigUInt64BE(7)).toISOString() : undefined,
      revocationReason: status === 1 ? responseData[15] : undefined
    };

  } catch (error) {
    logger.error('OCSP check failed', { error });
    throw new Error(`OCSP_ERROR: ${error.message}`);
  }
}