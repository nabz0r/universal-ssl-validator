export class Metrics {
  private counts: Map<string, number>;
  private timings: Map<string, number[]>;

  constructor() {
    this.counts = new Map();
    this.timings = new Map();
  }

  incrementCount(metric: string): void {
    const current = this.counts.get(metric) || 0;
    this.counts.set(metric, current + 1);
  }

  recordTiming(metric: string, duration: number): void {
    const timings = this.timings.get(metric) || [];
    timings.push(duration);
    this.timings.set(metric, timings);
  }

  getMetrics(): object {
    const metrics: any = {};
    
    // Counts
    for (const [key, value] of this.counts.entries()) {
      metrics[`count_${key}`] = value;
    }

    // Timings
    for (const [key, values] of this.timings.entries()) {
      if (values.length > 0) {
        metrics[`timing_${key}_avg`] = values.reduce((a, b) => a + b) / values.length;
        metrics[`timing_${key}_max`] = Math.max(...values);
        metrics[`timing_${key}_min`] = Math.min(...values);
      }
    }

    return metrics;
  }

  clear(): void {
    this.counts.clear();
    this.timings.clear();
  }
}
