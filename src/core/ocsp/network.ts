import * as https from 'https';
import { URL } from 'url';

export async function fetchOCSPResponse(url: string, request: Buffer, timeout: number): Promise<Buffer> {
  const parsedUrl = new URL(url);
  
  const options = {
    method: 'POST',
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || 443,
    path: parsedUrl.pathname + parsedUrl.search,
    headers: {
      'Content-Type': 'application/ocsp-request',
      'Content-Length': request.length
    },
    timeout
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }

      const chunks: Buffer[] = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(request);
    req.end();
  });
}