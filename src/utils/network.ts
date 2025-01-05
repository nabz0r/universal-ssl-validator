import { X509Certificate } from 'crypto';
import { OCSPResponse } from '../core/types';
import * as https from 'https';
import * as tls from 'tls';

export async function fetchCertificate(domain: string): Promise<X509Certificate> {
  return new Promise((resolve, reject) => {
    const socket = tls.connect({
      host: domain,
      port: 443,
      servername: domain,
      rejectUnauthorized: false
    }, () => {
      const cert = socket.getPeerCertificate(true);
      socket.end();
      if (cert) {
        resolve(new X509Certificate(cert.raw));
      } else {
        reject(new Error('No certificate found'));
      }
    });

    socket.on('error', (error) => {
      reject(new Error(`Failed to fetch certificate: ${error.message}`));
    });

    socket.setTimeout(10000, () => {
      socket.destroy();
      reject(new Error('Connection timeout'));
    });
  });
}

export async function checkOCSP(cert: X509Certificate): Promise<OCSPResponse> {
  // Implémentation basique de la vérification OCSP
  // TODO: Ajouter la logique complète
  return {
    status: 'unknown',
    producedAt: new Date().toISOString(),
    thisUpdate: new Date().toISOString(),
  };
}