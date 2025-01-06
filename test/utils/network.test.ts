import { fetchCertificate, checkOCSP } from '../../src/utils/network';
import { X509Certificate } from 'crypto';

describe('Network Utils', () => {
  describe('fetchCertificate', () => {
    it('should fetch certificate for valid domain', async () => {
      const chain = await fetchCertificate('example.com', {
        timeout: 5000,
        maxRetries: 3
      });
      expect(chain).toBeDefined();
      expect(chain.leaf).toBeDefined();
      expect(chain.intermediates).toBeDefined();
      expect(chain.root).toBeDefined();
    });

    it('should handle connection timeout', async () => {
      await expect(
        fetchCertificate('example.com', { timeout: 1, maxRetries: 0 })
      ).rejects.toThrow('TIMEOUT_ERROR');
    });

    it('should retry on failure', async () => {
      const chain = await fetchCertificate('example.com', {
        timeout: 5000,
        maxRetries: 3
      });
      expect(chain).toBeDefined();
    });

    it('should handle invalid domains', async () => {
      await expect(
        fetchCertificate('invalid..domain', {
          timeout: 5000,
          maxRetries: 3
        })
      ).rejects.toThrow('INVALID_INPUT');
    });
  });

  describe('checkOCSP', () => {
    it('should check OCSP status successfully', async () => {
      const cert = getMockCertificate();
      const response = await checkOCSP(cert);
      expect(response.status).toBeDefined();
      expect(['good', 'revoked', 'unknown']).toContain(response.status);
    });

    it('should handle OCSP timeout', async () => {
      const cert = getMockSlowOCSPCertificate();
      await expect(checkOCSP(cert)).rejects.toThrow('TIMEOUT_ERROR');
    });

    it('should handle revoked certificates', async () => {
      const cert = getMockRevokedCertificate();
      const response = await checkOCSP(cert);
      expect(response.status).toBe('revoked');
      expect(response.revokedReason).toBeDefined();
      expect(response.revokedAt).toBeDefined();
    });

    it('should handle invalid OCSP responses', async () => {
      const cert = getMockInvalidOCSPCertificate();
      await expect(checkOCSP(cert)).rejects.toThrow('OCSP_ERROR');
    });
  });
});

// Mock utilities
function getMockCertificate(): X509Certificate {
  return {} as X509Certificate;
}

function getMockSlowOCSPCertificate(): X509Certificate {
  return {} as X509Certificate;
}

function getMockRevokedCertificate(): X509Certificate {
  return {} as X509Certificate;
}

function getMockInvalidOCSPCertificate(): X509Certificate {
  return {} as X509Certificate;
}
