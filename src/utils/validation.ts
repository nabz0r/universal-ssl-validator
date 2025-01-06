const DOMAIN_REGEX = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;
const MAX_DOMAIN_LENGTH = 253;

export function isValidDomain(domain: string): boolean {
  if (!domain || typeof domain !== 'string') {
    return false;
  }

  // Vérifier la longueur
  if (domain.length > MAX_DOMAIN_LENGTH || domain.length < 3) {
    return false;
  }

  // Vérifier le format
  if (!DOMAIN_REGEX.test(domain)) {
    return false;
  }

  // Vérifier chaque partie du domaine
  const parts = domain.split('.');
  for (const part of parts) {
    // Chaque partie doit faire entre 1 et 63 caractères
    if (part.length > 63 || part.length < 1) {
      return false;
    }

    // Ne doit pas commencer ou finir par un tiret
    if (part.startsWith('-') || part.endsWith('-')) {
      return false;
    }

    // Vérifier les caractères autorisés
    if (!/^[a-zA-Z0-9-]+$/.test(part)) {
      return false;
    }
  }

  return true;
}

export function sanitizeDomain(domain: string): string {
  if (!domain || typeof domain !== 'string') {
    return '';
  }

  // Supprimer les espaces
  domain = domain.trim();

  // Convertir en minuscules
  domain = domain.toLowerCase();

  // Supprimer les protocoles
  domain = domain.replace(/^(https?:\/\/)?(www\.)?/i, '');

  // Supprimer tout ce qui suit un slash
  domain = domain.split('/')[0];

  return domain;
}

export function validateCertificateRequest(req: any): string[] {
  const errors: string[] = [];

  // Vérifier la présence du domaine
  if (!req.domain) {
    errors.push('MISSING_DOMAIN: Domain is required');
    return errors;
  }

  // Sanitizer le domaine
  const sanitizedDomain = sanitizeDomain(req.domain);

  // Vérifier la validité du domaine
  if (!isValidDomain(sanitizedDomain)) {
    errors.push('INVALID_DOMAIN: Domain format is invalid');
  }

  // Vérifier les options si présentes
  if (req.options) {
    if (typeof req.options.checkOCSP !== 'undefined' && typeof req.options.checkOCSP !== 'boolean') {
      errors.push('INVALID_OPTION: checkOCSP must be a boolean');
    }

    if (req.options.timeout && (typeof req.options.timeout !== 'number' || req.options.timeout < 1000 || req.options.timeout > 30000)) {
      errors.push('INVALID_OPTION: timeout must be between 1000 and 30000 ms');
    }
  }

  return errors;
}