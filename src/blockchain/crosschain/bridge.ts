import { ethers } from 'ethers';
import Web3 from 'web3';

interface ChainConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
  contractAddress: string;
  bridgeAddress: string;
}

class CrossChainBridge {
  private chains: Map<string, ChainConfig>;
  private providers: Map<string, ethers.providers.JsonRpcProvider>;
  private contracts: Map<string, ethers.Contract>;

  constructor() {
    this.chains = new Map();
    this.providers = new Map();
    this.contracts = new Map();
  }

  async addChain(config: ChainConfig): Promise<void> {
    this.chains.set(config.name, config);
    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl);
    this.providers.set(config.name, provider);

    const contract = new ethers.Contract(
      config.contractAddress,
      this.getBridgeABI(),
      provider
    );
    this.contracts.set(config.name, contract);
  }

  async initiateTransfer(
    fromChain: string,
    toChain: string,
    data: any,
    options: any = {}
  ): Promise<string> {
    const sourceContract = this.contracts.get(fromChain);
    const destinationConfig = this.chains.get(toChain);

    if (!sourceContract || !destinationConfig) {
      throw new Error('Invalid chain configuration');
    }

    const transferData = this.prepareTransferData(data, destinationConfig.chainId);

    const tx = await sourceContract.initiateTransfer(
      destinationConfig.bridgeAddress,
      transferData,
      options
    );

    return tx.hash;
  }

  async checkTransferStatus(txHash: string, chainName: string): Promise<string> {
    const contract = this.contracts.get(chainName);
    if (!contract) {
      throw new Error('Invalid chain');
    }

    const status = await contract.getTransferStatus(txHash);
    return this.decodeTransferStatus(status);
  }

  async completeTransfer(txHash: string, chainName: string): Promise<void> {
    const contract = this.contracts.get(chainName);
    if (!contract) {
      throw new Error('Invalid chain');
    }

    await contract.completeTransfer(txHash);
  }

  async verifyCertificateAcrossChains(certificateId: string): Promise<Map<string, boolean>> {
    const results = new Map<string, boolean>();

    for (const [chainName, contract] of this.contracts) {
      try {
        const isValid = await contract.verifyCertificate(certificateId);
        results.set(chainName, isValid);
      } catch (error) {
        console.error(`Error verifying certificate on ${chainName}:`, error);
        results.set(chainName, false);
      }
    }

    return results;
  }

  async syncCertificateData(certificateId: string): Promise<void> {
    const certificateData = await this.aggregateCertificateData(certificateId);
    
    for (const [chainName, contract] of this.contracts) {
      try {
        await contract.updateCertificateData(certificateId, certificateData);
      } catch (error) {
        console.error(`Error syncing data to ${chainName}:`, error);
      }
    }
  }

  private prepareTransferData(data: any, destinationChainId: number): string {
    return ethers.utils.defaultAbiCoder.encode(
      ['address', 'uint256', 'bytes'],
      [data.recipient, destinationChainId, data.payload]
    );
  }

  private decodeTransferStatus(status: number): string {
    const statusMap = {
      0: 'Pending',
      1: 'Completed',
      2: 'Failed'
    };
    return statusMap[status] || 'Unknown';
  }

  private async aggregateCertificateData(certificateId: string): Promise<any> {
    const data = {};
    
    for (const [chainName, contract] of this.contracts) {
      try {
        const chainData = await contract.getCertificateData(certificateId);
        data[chainName] = chainData;
      } catch (error) {
        console.error(`Error fetching data from ${chainName}:`, error);
      }
    }

    return this.mergeCertificateData(data);
  }

  private mergeCertificateData(data: any): any {
    return data;
  }

  private getBridgeABI(): any[] {
    return [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "recipient",
            "type": "address"
          },
          {
            "internalType": "bytes",
            "name": "data",
            "type": "bytes"
          }
        ],
        "name": "initiateTransfer",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "transferId",
            "type": "bytes32"
          }
        ],
        "name": "completeTransfer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];
  }
}

export default CrossChainBridge;