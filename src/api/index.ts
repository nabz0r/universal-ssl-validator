import express from 'express';
import { AIVulnerabilityDetector } from '../ai/vulnerability-detector';
import { EnergyMonitor } from '../monitoring/energy-monitor';
import { ValidationSystem } from '../core/validation-system';

export class SSLValidatorAPI {
    private app: express.Application;
    private aiDetector: AIVulnerabilityDetector;
    private energyMonitor: EnergyMonitor;

    constructor() {
        this.app = express();
        this.aiDetector = new AIVulnerabilityDetector();
        this.energyMonitor = new EnergyMonitor();
        this.setupRoutes();
    }

    private setupRoutes() {
        this.app.post('/api/v1/certificates/validate', async (req, res) => {
            const { certificate, format } = req.body;
            const result = await this.aiDetector.analyzeCertificate(certificate);
            res.json({
                validation: result,
                energy: this.energyMonitor.getCurrentMetrics()
            });
        });
    }

    public start(port: number) {
        this.app.listen(port, () => {
            console.log(`SSL Validator API running on port ${port}`);
        });
    }
}