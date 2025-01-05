import { X509Certificate } from 'crypto';

export function validateDates(cert: X509Certificate): boolean {
  const now = new Date();
  const notBefore = new Date(cert.validFrom);
  const notAfter = new Date(cert.validTo);
  return now >= notBefore && now <= notAfter;
}

export function validateKeyUsage(cert: X509Certificate): boolean {
  const keyUsage = cert.keyUsage;
  // Vérifie si le certificat a les usages de clé requis pour SSL/TLS
  return keyUsage && (
    keyUsage.includes('digitalSignature') ||
    keyUsage.includes('keyEncipherment')
  );
}

export async function validateChain(cert: X509Certificate): Promise<boolean> {
  // TODO: Implémenter la validation complète de la chaîne de certificats
  // 1. Vérifier la signature de chaque certificat dans la chaîne
  // 2. Vérifier jusqu'à une autorité de certification de confiance
  return true;
}