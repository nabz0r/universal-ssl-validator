import { X509Certificate } from 'crypto';
import { CertStore } from './cert-store';

export async function verifyCAConstraint(record: TLSARecord, cert: X509Certificate): Promise<boolean> {
  try {
    const caRoot = await CertStore.getInstance().getCACertificate(record.certificate);
    return cert.verify(caRoot.publicKey);
  } catch {
    return false;
  }
}

export async function verifyServiceCertConstraint(record: TLSARecord, cert: X509Certificate): Promise<boolean> {
  // Vérifie que le certificat correspond directement à l'enregistrement
  return record.certificate === cert.fingerprint256;
}

export async function verifyTrustAnchorAssertion(record: TLSARecord, cert: X509Certificate): Promise<boolean> {
  try {
    const trustAnchor = await CertStore.getInstance().getTrustAnchor(record.certificate);
    const chain = await buildCertificateChain(cert);
    return chain.some(c => c.verify(trustAnchor.publicKey));
  } catch {
    return false;
  }
}

export async function verifyDomainIssuedCert(record: TLSARecord, cert: X509Certificate): Promise<boolean> {
  // Vérifie le certificat auto-signé
  if (record.certificate !== cert.fingerprint256) return false;
  return cert.verify(cert.publicKey);
}

async function buildCertificateChain(cert: X509Certificate): Promise<X509Certificate[]> {
  const chain = [cert];
  let current = cert;
  
  // Limite la profondeur à 10 pour éviter les boucles
  for (let i = 0; i < 10; i++) {
    try {
      const issuerCert = await CertStore.getInstance().getCACertificate(current.issuer.fingerprint256);
      chain.push(issuerCert);
      
      if (issuerCert.subject === issuerCert.issuer) break;
      current = issuerCert;
    } catch {
      break;
    }
  }
  
  return chain;
}