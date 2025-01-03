import { Certificate } from '../core/types';
import { CertificateProvider, ProviderInfo } from './provider-interface';
import { EnergyMonitor } from '../monitoring/energy-monitor';

export class GoDaddyProvider implements CertificateProvider {
    private apiKey: string;
    private apiSecret: string;
    private energyMonitor: EnergyMonitor;

    constructor(apiKey: string, apiSecret: string) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.energyMonitor = new EnergyMonitor();
    }

    public async requestCertificate(domain: string): Promise<Certificate> {
        const startTime = process.hrtime();
        try {
            const order = await this.createCertificateOrder(domain);
            const cert = await this.processOrder(order);
            this.recordEnergyMetrics(startTime);
            return cert;
        } catch (error) {
            throw new Error(`GoDaddy certificate request failed: ${error.message}`);
        }
    }
}