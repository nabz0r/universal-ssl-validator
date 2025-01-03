import { Certificate } from '../core/types';
import { ACME } from '@root/acme';
import { EnergyMonitor } from '../monitoring/energy-monitor';
import { CertificateProvider, ProviderInfo } from './provider-interface';

export class LetsEncryptProvider implements CertificateProvider {
    private client: ACME;
    private energyMonitor: EnergyMonitor;
    private accountKey: string;

    constructor(accountKey: string) {
        this.accountKey = accountKey;
        this.energyMonitor = new EnergyMonitor();
        this.initializeClient();
    }

    private async initializeClient(): Promise<void> {
        this.client = new ACME({
            directoryUrl: 'https://acme-v02.api.letsencrypt.org/directory',
            accountKey: this.accountKey
        });
        await this.client.init();
    }

    public async requestCertificate(domain: string): Promise<Certificate> {
        const startTime = process.hrtime();
        try {
            const order = await this.client.createOrder({
                identifiers: [{ type: 'dns', value: domain }]
            });
            const cert = await this.processCertificateOrder(order);
            this.recordEnergyMetrics(startTime);
            return cert;
        } catch (error) {
            throw new Error(`Certificate request failed: ${error.message}`);
        }
    }

    private recordEnergyMetrics(startTime: [number, number]): void {
        const [seconds, nanoseconds] = process.hrtime(startTime);
        this.energyMonitor.recordOperation('certificate_request', seconds + nanoseconds / 1e9);
    }
}