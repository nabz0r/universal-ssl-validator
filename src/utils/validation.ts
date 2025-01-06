const DOMAIN_REGEX = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)*[a-zA-Z0-9][a-zA-Z0-9-_]+\.[a-zA-Z]{2,11}?$/;
const MAX_DOMAIN_LENGTH = 253;

export function isValidDomain(domain: string): boolean {
  if (!domain || typeof domain !== 'string') {
    return false;
  }

  if (domain.length > MAX_DOMAIN_LENGTH || domain.length < 3) {
    return false;
  }

  if (!DOMAIN_REGEX.test(domain)) {
    return false;
  }

  const parts = domain.split('.');
  for (const part of parts) {
    if (part.length > 63 || part.length < 1) {
      return false;
    }

    if (part.startsWith('-') || part.endsWith('-')) {
      return false;
    }

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

  domain = domain.trim().toLowerCase();
  domain = domain.replace(/^(https?:\/\/)?(www\.)?/i, '');
  domain = domain.split('/')[0];

  return domain;
}

export function validateCertificateRequest(req: any): string[] {
  const errors: string[] = [];

  if (!req.domain) {
    errors.push('MISSING_DOMAIN: Domain is required');
    return errors;
  }

  const sanitizedDomain = sanitizeDomain(req.domain);

  if (!isValidDomain(sanitizedDomain)) {
    errors.push('INVALID_DOMAIN: Domain format is invalid');
  }

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