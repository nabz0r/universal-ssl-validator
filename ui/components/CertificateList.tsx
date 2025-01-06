import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function CertificateList() {
  const [certificates, setCertificates] = useState([]);

  useEffect(() => {
    fetchCertificates();
  }, []);

  async function fetchCertificates() {
    try {
      const response = await fetch('/api/certificates');
      const data = await response.json();
      setCertificates(data);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Certificates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {certificates.map((cert: any) => (
            <div
              key={cert.id}
              className="p-4 border rounded hover:bg-gray-50"
            >
              <p className="font-bold">{cert.domain}</p>
              <p className="text-sm text-gray-500">
                Validated: {new Date(cert.timestamp).toLocaleString()}
              </p>
              <p className={`text-sm ${
                cert.valid ? 'text-green-600' : 'text-red-600'
              }`}>
                Status: {cert.valid ? 'Valid' : 'Invalid'}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
