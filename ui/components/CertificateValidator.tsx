import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CertificateValidator() {
  const [domain, setDomain] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function validateCertificate() {
    setLoading(true);
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Validation error:', error);
      setResult({ error: 'Validation failed' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Validate Certificate</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Input
            type="text"
            placeholder="Enter domain (e.g., example.com)"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
          <Button 
            onClick={validateCertificate}
            disabled={loading}
          >
            {loading ? 'Validating...' : 'Validate'}
          </Button>
        </div>

        {result && (
          <div className="mt-4">
            <h3 className="font-bold mb-2">Results:</h3>
            <pre className="bg-gray-100 p-4 rounded">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
