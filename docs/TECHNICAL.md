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

### Device Monitoring
- Métriques temps réel
- État connexion
- Validité certificats
- Latence/performance
- Détection anomalies

### Fleet Monitoring
- Métriques agrégées
- Taux d'erreurs
- Santé globale
- Alertes automatiques
- Rotation certificates

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

#### Monitoring
```typescript
GET /monitoring/device/{id}
GET /monitoring/device/{id}/metrics
GET /monitoring/fleet/{id}
GET /monitoring/fleet/{id}/metrics
GET /monitoring/alerts
```

### WebSocket
```typescript
ws://api/v1/events
ws://api/v1/monitoring/device/{id}
ws://api/v1/monitoring/fleet/{id}
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

### Monitoring
```yaml
monitoring:
  device:
    interval: 60     # Secondes
    timeout: 5000    # ms
    retries: 3

  fleet:
    interval: 300    # Secondes
    aggregation: 15  # Minutes

  alerts:
    errorRate: 0.1   # 10%
    latency: 1000    # ms
    certDays: 30     # Jours
```

## Base de Données

### MongoDB
- Devices & Flottes
- Configuration
- États & Métadonnées

### TimescaleDB 
- Métriques temporelles
- Données historiques
- Agrégations

### Redis
- Cache temps réel
- États & Métriques
- Rate limiting

## Types de Métriques

### Device Metrics
```typescript
interface DeviceMetrics {
  deviceId: string;
  status: DeviceStatus;
  connected: boolean;
  certDaysRemaining: number;
  errorCount: number;
  latency: number;
  timestamp: Date;
}
```

### Fleet Metrics 
```typescript
interface FleetMetrics {
  fleetId: string;
  totalDevices: number;
  connectedDevices: number;
  errorRate: number;
  avgCertDaysRemaining: number;
  certRotationsPending: number;
  timestamp: Date;
}
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
  - device_connected
  - fleet_error_rate
  - cert_days_remaining
```