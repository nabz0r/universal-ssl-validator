# Security Guidelines 🔒

## Overview

The Universal SSL Validator implements multiple security layers to ensure safe and reliable certificate validation:

## Main Security Features

### TLS Security
- Enforced TLS connection verification
- Disabled legacy protocols (SSLv2, SSLv3, TLSv1)
- 5-second connection timeout
- Proper socket cleanup

### Input Validation
- Strict domain format validation
- Input sanitization
- Length and character checks
- Protection against special characters

### Rate Limiting
- 100 requests per 15 minutes by default
- IP and user-based limiting
- Transparent rate limit headers
- Graceful Redis fallback

### Error Handling
- Standardized error messages
- No sensitive information leakage
- Proper error categorization
- Secure logging practices

## Configuration

### Rate Limiter Configuration
```typescript
import { RateLimiter } from './middleware/rateLimiter';

// Custom configuration
const rateLimiter = new RateLimiter(
  15 * 60 * 1000, // window in ms
  100             // max requests
);

// Apply to Express app
app.use(rateLimiter.middleware);
```

### Validator Options
```typescript
const validator = new SSLValidator({
  checkOCSP: true,    // Enable OCSP checking
  timeout: 5000,      // 5s timeout
  maxRetries: 3,      // Max retry attempts
  cache: true,        // Enable caching
  cacheExpiry: 3600   // Cache TTL in seconds
});
```

## Error Categories

- `INVALID_INPUT`: Input validation errors
- `NETWORK_ERROR`: Connection issues
- `CERT_ERROR`: Certificate problems
- `TIMEOUT_ERROR`: Timeout issues
- `OCSP_ERROR`: OCSP verification failures
- `INTERNAL_ERROR`: System errors
- `UNKNOWN_ERROR`: Unclassified errors

## Security Headers

All responses include:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## Best Practices

1. Always validate domains before processing
2. Use the provided sanitization functions
3. Handle rate limiting properly
4. Monitor security logs
5. Keep dependencies updated

## Security Reports

If you discover any security issues, please report them to security@universal-ssl-validator.io
