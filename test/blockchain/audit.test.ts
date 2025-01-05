import { ethers } from 'ethers';
import BlockchainAuditService from '../../src/blockchain/audit';
import { MockProvider } from 'ethereum-waffle';

describe('BlockchainAuditService', () => {
  let auditService: BlockchainAuditService;
  let provider: MockProvider;
  let signer: ethers.Wallet;

  beforeEach(async () => {
    provider = new MockProvider();
    [signer] = provider.getWallets();

    // Déploiement du contrat de test
    const Contract = await ethers.getContractFactory('CertificateAudit');
    const contract = await Contract.deploy();

    auditService = new BlockchainAuditService(
      provider.getUrl(),
      contract.address,
      Contract.interface
    );
  });

  describe('recordAudit', () => {
    it('should record a new audit successfully', async () => {
      const audit = {
        domain: 'test.com',
        certificateHash: '0x1234',
        timestamp: Date.now(),
        validationResult: true,
        auditor: signer.address
      };

      const tx = await auditService.recordAudit(audit);
      expect(tx).toBeTruthy();
    });

    it('should fail with invalid data', async () => {
      const audit = {
        domain: '',
        certificateHash: '',
        timestamp: 0,
        validationResult: false,
        auditor: '0x0'
      };

      await expect(auditService.recordAudit(audit)).rejects.toThrow();
    });
  });

  describe('getAuditHistory', () => {
    it('should retrieve audit history for a domain', async () => {
      const audit = {
        domain: 'test.com',
        certificateHash: '0x1234',
        timestamp: Date.now(),
        validationResult: true,
        auditor: signer.address
      };

      await auditService.recordAudit(audit);
      const history = await auditService.getAuditHistory('test.com');
      
      expect(history).toHaveLength(1);
      expect(history[0].domain).toBe('test.com');
    });

    it('should return empty array for unknown domain', async () => {
      const history = await auditService.getAuditHistory('unknown.com');
      expect(history).toHaveLength(0);
    });
  });

  describe('verifyAudit', () => {
    it('should verify a valid audit transaction', async () => {
      const audit = {
        domain: 'test.com',
        certificateHash: '0x1234',
        timestamp: Date.now(),
        validationResult: true,
        auditor: signer.address
      };

      const tx = await auditService.recordAudit(audit);
      const isValid = await auditService.verifyAudit(tx);
      
      expect(isValid).toBe(true);
    });

    it('should return false for invalid transaction hash', async () => {
      const isValid = await auditService.verifyAudit('0x1234');
      expect(isValid).toBe(false);
    });
  });
});
