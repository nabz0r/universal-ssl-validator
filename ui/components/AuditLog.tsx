import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function AuditLog() {
  const [auditLogs, setAuditLogs] = useState([]);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  async function fetchAuditLogs() {
    try {
      const response = await fetch('/api/audit');
      const data = await response.json();
      setAuditLogs(data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {auditLogs.map((log: any) => (
            <div
              key={log.id}
              className="p-4 border rounded hover:bg-gray-50"
            >
              <p className="font-bold">{log.action}</p>
              <p className="text-sm text-gray-500">
                {new Date(log.timestamp).toLocaleString()}
              </p>
              <p className="text-sm">Domain: {log.domain}</p>
              <p className="text-sm text-gray-600">
                Auditor: {log.auditor}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
