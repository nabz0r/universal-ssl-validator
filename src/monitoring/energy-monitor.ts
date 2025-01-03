import { EventEmitter } from 'events';
import * as os from 'os';

export class EnergyMonitor extends EventEmitter {
    private metrics: any = {};

    constructor() {
        super();
        this.initializeMonitoring();
    }

    private initializeMonitoring() {
        setInterval(() => this.updateMetrics(), 1000);
    }

    private async updateMetrics() {
        const cpuUsage = os.loadavg()[0];
        const memoryUsage = (os.totalmem() - os.freemem()) / os.totalmem() * 100;
        
        this.metrics = {
            cpuUsage,
            memoryUsage,
            timestamp: new Date()
        };

        this.emit('metrics-updated', this.metrics);
    }

    public getCurrentMetrics() {
        return this.metrics;
    }
}