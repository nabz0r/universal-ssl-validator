import { ethers } from 'ethers';

interface CertificateAudit {
  domain: string;
  certificateHash: string;
  timestamp: number;
  validationResult: boolean;
  auditor: string;
}

class BlockchainAuditService {
  private provider: ethers.providers.Provider;
  private contract: ethers.Contract;

  constructor(providerUrl: string, contractAddress: string, abi: any) {
    this.provider = new ethers.providers.JsonRpcProvider(providerUrl);
    this.contract = new ethers.Contract(contractAddress, abi, this.provider);
  }

  async recordAudit(audit: CertificateAudit): Promise<string> {
    try {
      const tx = await this.contract.recordAudit(
        audit.domain,
        audit.certificateHash,
        audit.timestamp,
        audit.validationResult,
        audit.auditor
      );
      const receipt = await tx.wait();
      return receipt.transactionHash;
    } catch (error) {
      console.error('Error recording audit:', error);
      throw error;
    }
  }

  async getAuditHistory(domain: string): Promise<CertificateAudit[]> {
    try {
      const events = await this.contract.queryFilter(
        this.contract.filters.AuditRecorded(domain)
      );
      return events.map(event => ({
        domain: event.args.domain,
        certificateHash: event.args.certificateHash,
        timestamp: event.args.timestamp.toNumber(),
        validationResult: event.args.validationResult,
        auditor: event.args.auditor
      }));
    } catch (error) {
      console.error('Error getting audit history:', error);
      throw error;
    }
  }

  async verifyAudit(transactionHash: string): Promise<boolean> {
    try {
      const tx = await this.provider.getTransaction(transactionHash);
      const receipt = await tx.wait();
      return receipt.status === 1;
    } catch (error) {
      console.error('Error verifying audit:', error);
      return false;
    }
  }
}

export default BlockchainAuditService;