# Guide Monitoring

## Systèmes de Monitoring

### Device Monitoring
- Métriques temps réel des devices
- État connexion
- Validité certificats
- Latence et performances
- Alertes anomalies

### Fleet Monitoring
- Métriques agrégées par flotte
- Taux d'erreur
- Santé globale
- Alertes configurables
- Rotation certificats

## Métriques Disponibles

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

## Configuration Monitoring

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

## Alertes

### Niveaux d'Alerte
- INFO: Information standard
- WARN: Attention requise
- ERROR: Intervention nécessaire
- CRITICAL: Action immédiate

### Types d'Alertes
```typescript
type AlertType =
  | 'CONNECTIVITY'
  | 'CERT_EXPIRY'
  | 'ERROR_RATE'
  | 'LATENCY'
  | 'SECURITY';
```

## Storage & Rétention

### TimescaleDB
- Métriques séries temporelles
- Agrégation automatique
- Rétention configurable
- Compression données

### Redis Cache
- État temps réel
- Cache métriques
- Queues alertes
- Rate limiting

## API Monitoring

### REST Endpoints
```typescript
// Device Monitoring
GET /api/v1/monitoring/device/{id}
GET /api/v1/monitoring/device/{id}/metrics

// Fleet Monitoring
GET /api/v1/monitoring/fleet/{id}
GET /api/v1/monitoring/fleet/{id}/metrics

// Alerts
GET /api/v1/monitoring/alerts
POST /api/v1/monitoring/alerts/config
```

### WebSocket Events
```typescript
// Subscribe
client.subscribe('monitoring/device/{id}');
client.subscribe('monitoring/fleet/{id}');

// Alert Events
client.on('alert', (alert: Alert) => {
  console.log('New alert:', alert);
});
```

## Intégrations

### Prometheus/Grafana
- Métriques devices/flottes
- Dashboards temps réel
- Alerting intégré
- Visualisations custom

### ELK Stack
- Agrégation logs
- Analyse sécurité
- Audit trail
- Recherche avancée

## CLI Monitoring

```bash
# Device Status
ssl-validator monitor device device-001

# Fleet Metrics
ssl-validator monitor fleet fleet-001

# Alert Config
ssl-validator monitor alerts --config alerts.yml
```

## Best Practices

### Performance
- Intervalles adaptés à l'usage
- Cache métriques fréquentes
- Agrégation données historiques
- Rate limiting requêtes

### Sécurité
- Authentification monitoring
- Audit logs accès
- Encryption données
- Isolation réseaux