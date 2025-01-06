# Guide Technique

## Architecture

Le validateur SSL universel implémente une validation complète des certificats avec :

### Core Validator
- Validation X.509 
- Support TLS 1.2/1.3
- OCSP Real-time
- Certificate Transparency (CT) Logs
- DANE/TLSA
- Validation chaîne de certification
- Trust Store système

### OCSP
- Vérification OCSP Stapling
- Gestion des timeouts
- Cache de réponses
- Retry automatique

### CT Logs
- Extraction SCT (RFC 6962)
- Vérification signatures SCT
- Support logs multiples
- Validation de timestamps

### DANE/TLSA (RFC 6698)
- PKIX-TA (CA constraint)
- PKIX-EE (Service cert)
- DANE-TA (Trust anchor)
- DANE-EE (Domain cert)
- Tous modes de matching (SHA-256/512)

### Trust Store
- CA système
- Trust anchors custom
- Blacklist/Whitelist
- Rotation auto des CAs
- Support des cross-signed certs

## API & Endpoints

### REST API

#### SSL Validation
```typescript
GET /validate/{domain}
POST /validate/bulk
```

#### OCSP
```typescript
GET /ocsp/check/{serial}
POST /ocsp/stapling
```

#### CT Logs
```typescript
GET /ct/logs/{domain}
POST /ct/verify
```

#### DANE/TLSA
```typescript
GET /dane/validate/{domain}
GET /dane/records/{domain}
```

### WebSocket
```typescript
ws://api/v1/events
```

## Configuration

### OCSP
```yaml
ocsp:
  timeout: 5s
  maxRetries: 3
  cache: true
  cacheExpiry: 3600
```

### CT Logs
```yaml
ctLogs:
  minLogs: 2
  minTimestamp: 3600
  trustedLogs:
    - operator: "Google"
      key: "..."
    - operator: "Cloudflare" 
      key: "..."
```

### DANE
```yaml
dane:
  enabled: true
  enforced: false
  supportedUsages: [0,1,2,3]
  supportedMatching: [1,2]
```

### Trust Store
```yaml
trustStore:
  systemCAs: true
  customCAs: "/path/to/cas"
  blacklist: "/path/to/blacklist"
  autoUpdate: true
```

## Journalisation

### Logs Structurés
```json
{
  "level": "info",
  "event": "cert.validate", 
  "domain": "example.com",
  "chain": true,
  "ct": true,
  "ocsp": "good",
  "dane": true
}
```

### Métriques
```yaml
metrics:
  - validation_total 
  - validation_errors
  - ocsp_latency
  - ct_logs_count
  - dane_records
  - chain_length
```