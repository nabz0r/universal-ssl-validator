export interface Certificate {
  id: string;
  domain: string;
  status: 'valid' | 'warning' | 'expired';
  expiryDate: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  fingerprint: string;
}

export interface ValidationMetrics {
  totalValidations: number;
  successRate: number;
  avgResponseTime: number;
  activeMonitors: number;
}

export interface AuditLog {
  id: string;
  type: 'validation' | 'error' | 'info';
  message: string;
  timestamp: string;
  domain?: string;
  details?: Record<string, any>;
}

export interface DashboardState {
  certificates: {
    items: Certificate[];
    loading: boolean;
    error: string | null;
  };
  metrics: {
    data: ValidationMetrics | null;
    loading: boolean;
    error: string | null;
  };
  auditLogs: {
    items: AuditLog[];
    loading: boolean;
    error: string | null;
  };
}