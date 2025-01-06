import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function DashboardMetrics() {
  const [metrics, setMetrics] = useState({
    totalValidations: 0,
    validCertificates: 0,
    avgResponseTime: 0,
    errorRate: 0
  });

  useEffect(() => {
    fetchMetrics();
  }, []);

  async function fetchMetrics() {
    try {
      const response = await fetch('/api/metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Total Validations</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{metrics.totalValidations}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Valid Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{metrics.validCertificates}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Avg Response Time</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{metrics.avgResponseTime}ms</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Error Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{metrics.errorRate}%</p>
        </CardContent>
      </Card>
    </div>
  );
}
