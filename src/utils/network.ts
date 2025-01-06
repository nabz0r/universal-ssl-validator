import { X509Certificate } from 'crypto';
import { OCSPResponse } from '../core/types';
import * as https from 'https';
import * as tls from 'tls';
import { isValidDomain } from './validation';

export async function fetchCertificate(domain: string): Promise<X509Certificate> {
  if (!isValidDomain(domain)) {
    throw new Error('INVALID_INPUT: Domain validation failed');
  }

  return new Promise((resolve, reject) => {
    const socket = tls.connect({
      host: domain,
      port: 443,
      servername: domain,
      rejectUnauthorized: true, // Activation de la vérification
      secureContext: tls.createSecureContext({
        secureOptions: tls.constants.SSL_OP_NO_SSLv2 | 
                      tls.constants.SSL_OP_NO_SSLv3 |
                      tls.constants.SSL_OP_NO_TLSv1
      })
    }, () => {
      try {
        const cert = socket.getPeerCertificate(true);
        socket.end();
        if (cert && cert.raw) {
          resolve(new X509Certificate(cert.raw));
        } else {
          reject(new Error('CERT_ERROR: No valid certificate found'));
        }
      } catch (error) {
        reject(new Error('CERT_ERROR: Failed to process certificate'));
      }
    });

    socket.on('error', (error) => {
      reject(new Error('NETWORK_ERROR: Connection failed'));
    });

    socket.setTimeout(5000, () => {
      socket.destroy();
      reject(new Error('TIMEOUT_ERROR: Connection timeout'));
    });
  });
}

export async function checkOCSP(cert: X509Certificate): Promise<OCSPResponse> {
  if (!cert) {
    throw new Error('INVALID_INPUT: Certificate is required');
  }

  // TODO: Implement complete OCSP check
  return {
    status: 'unknown',
    producedAt: new Date().toISOString(),
    thisUpdate: new Date().toISOString(),
  };
}