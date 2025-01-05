import { X509Certificate } from 'crypto';
import * as asn1 from 'asn1.js';
import { OCSPResponse } from '../types';
import { fetchOCSPResponse } from './network';
import { parseOCSPResponse, buildOCSPRequest } from './asn1';
import { extractOCSPUrl } from './utils';

export class OCSPChecker {
  private readonly options: OCSPOptions;

  constructor(options: Partial<OCSPOptions> = {}) {
    this.options = {
      timeout: 10000,
      maxRetries: 3,
      ...options
    };
  }

  async check(cert: X509Certificate, issuerCert: X509Certificate): Promise<OCSPResponse> {
    try {
      // 1. Extract OCSP URL
      const ocspUrl = extractOCSPUrl(cert);
      if (!ocspUrl) {
        throw new Error('No OCSP URL found in certificate');
      }

      // 2. Build OCSP request
      const ocspRequest = buildOCSPRequest(cert, issuerCert);

      // 3. Send request with retry logic
      const response = await this.sendRequestWithRetry(ocspUrl, ocspRequest);

      // 4. Parse and validate response
      return this.validateResponse(response);
    } catch (error) {
      throw new OCSPError(`OCSP check failed: ${error.message}`);
    }
  }

  private async sendRequestWithRetry(url: string, request: Buffer): Promise<Buffer> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.options.maxRetries; attempt++) {
      try {
        return await fetchOCSPResponse(url, request, this.options.timeout);
      } catch (error) {
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  private validateResponse(response: Buffer): OCSPResponse {
    const parsed = parseOCSPResponse(response);

    // Validate response status
    if (parsed.responseStatus !== 0) {
      throw new OCSPError(`Invalid OCSP response status: ${parsed.responseStatus}`);
    }

    return {
      status: this.translateStatus(parsed.certStatus),
      producedAt: parsed.producedAt.toISOString(),
      thisUpdate: parsed.thisUpdate.toISOString(),
      nextUpdate: parsed.nextUpdate?.toISOString(),
      revokedReason: parsed.revocationReason
    };
  }

  private translateStatus(status: number): OCSPResponse['status'] {
    switch (status) {
      case 0: return 'good';
      case 1: return 'revoked';
      default: return 'unknown';
    }
  }
}

export interface OCSPOptions {
  timeout: number;
  maxRetries: number;
}

export class OCSPError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OCSPError';
  }
}