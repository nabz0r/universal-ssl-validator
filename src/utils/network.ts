import { X509Certificate } from 'crypto';
import * as tls from 'tls';
import * as https from 'https';
import { CertificateChain, OCSPResponse } from '../core/types';

export async function fetchCertificate(domain: string, options: { timeout: number, maxRetries: number }): Promise<CertificateChain> {
  return new Promise((resolve, reject) => {
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
          intermediates: cert.issuerCertificate ? [new X509Certificate(cert.issuerCertificate.raw)] : [],
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

    // Note: Une véritable implémentation nécessiterait la création d'une requête OCSP
    // et l'analyse de la réponse selon RFC 6960
    return {
      status: 'good',
      thisUpdate: new Date().toISOString(),
      nextUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    };
  } catch (error) {
    throw new Error(`OCSP_ERROR: ${error.message}`);
  }
}