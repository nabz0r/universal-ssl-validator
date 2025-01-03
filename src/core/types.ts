export interface Certificate {
  data: Buffer;
  format: string;
  metadata?: Record<string, any>;
}

export interface ValidationResult {
  isValid: boolean;
  expirationDate: Date;
  issuer: string;
  subject: string;
  processingTime: number;
  errors?: string[];
}
