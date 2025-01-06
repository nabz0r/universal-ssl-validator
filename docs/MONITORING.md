# Guide de Monitoring

## Métriques Disponibles

### Validation SSL
- `ssl_validations_total` : Compteur total des validations
- `ssl_validation_duration_seconds` : Durée des validations
- `ssl_ocsp_latency_seconds` : Latence OCSP
- `ssl_cert_expiry_days` : Jours avant expiration
- `ssl_chain_length` : Longueur des chaînes

### Performance
- Latences
- Taux d'erreur
- Utilisation du cache
- Consommation ressources

### Sécurité
- Tentatives de rate limiting
- Erreurs de validation
- Anomalies détectées

## Alertes

### Configuration
```yaml
alerts:
  expiry:
    threshold: 30d
    channels: [email, slack]
  errors:
    threshold: 5
    window: 5m
  security:
    sensitivity: high
```

### Types d'Alertes
- Expiration certificats
- Erreurs répétées
- Anomalies sécurité
- Problèmes performance

## Dashboards

### Grafana
- Vue générale
- Performances
- Sécurité
- Certificats

### Panels Recommandés
1. Validation Status
2. Error Rates
3. Response Times
4. Expiration Timeline
5. Security Events

## Logging

### Structure
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "level": "info",
  "event": "validation",
  "domain": "example.com",
  "result": { ... },
  "duration": 123,
  "metadata": { ... }
}
```

### Niveaux
- DEBUG : Détails techniques
- INFO : Opérations normales
- WARN : Problèmes potentiels
- ERROR : Erreurs applicatives
- FATAL : Erreurs critiques

## Retention

### Données
- Métriques : 30 jours
- Logs : 90 jours
- Alertes : 1 an

### Agrégation
- Raw data : 24h
- Hourly : 7 jours
- Daily : 30 jours
- Monthly : 1 an