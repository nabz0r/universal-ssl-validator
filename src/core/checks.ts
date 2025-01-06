import { X509Certificate } from 'crypto';
import { CertificateChain } from './types';

export async function validateDates(cert: X509Certificate): Promise<boolean> {
  const now = new Date();
  const notBefore = new Date(cert.validFrom);
  const notAfter = new Date(cert.validTo);
  
  return now >= notBefore && now <= notAfter;
}

export async function validateKeyUsage(cert: X509Certificate): Promise<boolean> {
  const keyUsage = cert.keyUsage;
  if (!keyUsage) return false;

  // Vérifie les usages requis pour un certificat SSL/TLS
  const requiredUsages = ['digitalSignature', 'keyEncipherment'];
  return requiredUsages.every(usage => keyUsage.includes(usage));
}

export async function validateChain(chain: CertificateChain): Promise<boolean> {
  if (!chain.leaf || !chain.intermediates.length || !chain.root) {
    return false;
  }

  try {
    // Vérifie la chaîne du certificat leaf à la racine
    let current = chain.leaf;
    
    // Vérifie chaque certificat intermédiaire
    for (const intermediate of chain.intermediates) {
      if (!current.verify(intermediate.publicKey)) {
        return false;
      }
      current = intermediate;
    }

    // Vérifie le dernier intermédiaire avec le root
    if (!current.verify(chain.root.publicKey)) {
      return false;
    }

    // Vérifie si le root est self-signed
    return chain.root.verify(chain.root.publicKey);
    
  } catch (error) {
    console.error('Chain validation error:', error);
    return false;
  }
}