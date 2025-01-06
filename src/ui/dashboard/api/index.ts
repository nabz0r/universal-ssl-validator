import { Certificate, ValidationMetrics, AuditLog } from '../store/types';

const API_BASE = '/api';

export const api = {
  certificates: {
    getAll: async (): Promise<Certificate[]> => {
      const response = await fetch(`${API_BASE}/certificates`);
      if (!response.ok) throw new Error('Failed to fetch certificates');
      return response.json();
    },

    validate: async (domain: string): Promise<Certificate> => {
      const response = await fetch(`${API_BASE}/certificates/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });
      if (!response.ok) throw new Error('Validation failed');
      return response.json();
    },

    renew: async (id: string): Promise<Certificate> => {
      const response = await fetch(`${API_BASE}/certificates/${id}/renew`, {
        method: 'POST'
      });
      if (!response.ok) throw new Error('Renewal failed');
      return response.json();
    }
  },

  metrics: {
    get: async (): Promise<ValidationMetrics> => {
      const response = await fetch(`${API_BASE}/metrics`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      return response.json();
    }
  },

  auditLogs: {
    getAll: async (): Promise<AuditLog[]> => {
      const response = await fetch(`${API_BASE}/audit-logs`);
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      return response.json();
    }
  }
};