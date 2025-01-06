# Guide de Développement

## Architecture

```
.
├── src/
│   ├── core/            # Core SSL validation
│   │   ├── validator.ts
│   │   ├── ct-verification.ts
│   │   ├── dane-validator.ts
│   │   └── checks.ts
│   ├── iot/             # IoT support
│   │   ├── adapters/
│   │   ├── registry/
│   │   ├── fleet/
│   │   └── cert/
│   ├── utils/           # Utilitaires
│   └── api/             # API REST & WS

```

## Setup Dev

```bash
# Install dependencies
npm install

# Start dev environment
npm run dev

# Build
npm run build

# Tests
npm test
```

## Standards de Code

### Typescript
- Strict mode activé
- Types explicites
- Interfaces pour les APIs publiques
- Générics pour la réutilisabilité

### Tests
```typescript
describe('SSLValidator', () => {
  it('should validate certificates', async () => {
    const validator = new SSLValidator();
    const result = await validator.validate('domain.com');
    expect(result.valid).toBe(true);
  });
});
```

### Logging
```typescript
// Structured logging
logger.info('Certificate validated', {
  domain,
  valid: true,
  certInfo: { /* ... */ }
});
```

## Core System

### SSL Validation
```typescript
// Validation complete
const result = await validator.validateCertificate({
  domain: 'example.com',
  options: {
    checkOCSP: true,
    checkCT: true,
    checkDANE: true
  }
});
```

### IoT Integration
```typescript
// Device registration
const device = await registry.register({
  id: 'device-001',
  type: 'sensor',
  protocols: ['mqtt'],
  certificates: { /* ... */ }
});

// Fleet management
const fleet = await fleetManager.createFleet({
  name: 'Production',
  config: { /* ... */ }
});
```

## API Documentation

L'API est documentée avec OpenAPI:
```yaml
openapi: 3.0.0
info:
  title: SSL Validator API
paths:
  /validate/{domain}:
    get:
      summary: Validate certificate
```

## Métriques & Monitoring

### Prometheus
```typescript
// Core metrics
validation_total.inc();
validation_duration.observe(duration);

// IoT metrics
devices_connected.set(connectedCount);
fleet_cert_rotations.inc();
```

## Sécurité

### Authentication
```typescript
// API auth
app.use(authMiddleware({
  type: 'bearer',
  verify: verifyToken
}));
```

### Rate Limiting
```typescript
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));
```

## Contribution

### Pull Requests
1. Fork le repo
2. Créer branche (`feat/new-feature`)
3. Commit changes
4. Push to branch
5. Open PR

### Guidelines
- Tests obligatoires
- Documentation à jour
- Changelog mis à jour
- Clean code
- Revue de code requise

## Release Process

1. Update version
2. Update CHANGELOG.md
3. Build & test
4. Create tag
5. Deploy

## Infrastructure

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]
```

### CI/CD
```yaml
name: CI
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm test
```

## Resources

- [RFC 6962](https://tools.ietf.org/html/rfc6962) - Certificate Transparency
- [RFC 6698](https://tools.ietf.org/html/rfc6698) - DANE
- [MQTT 5.0](https://docs.oasis-open.org/mqtt/mqtt/v5.0/mqtt-v5.0.html)
- [CoAP](https://tools.ietf.org/html/rfc7252)