# API Documentation

## REST API

### Validation de Certificat

#### Requête
`GET /api/v1/validate/{domain}`

#### Paramètres
- `domain` (obligatoire) : Domaine à valider
- `options` (optionnel) : Options de validation

#### Réponse
```json
{
  "valid": true,
  "certInfo": {
    "subject": "...",
    "issuer": "...",
    "validFrom": "2024-01-01T00:00:00Z",
    "validTo": "2025-01-01T00:00:00Z",
    "serialNumber": "...",
    "fingerprint": "...",
    "keyUsage": ["digitalSignature", "keyEncipherment"],
    "extendedKeyUsage": ["serverAuth", "clientAuth"],
    "subjectAltNames": ["example.com", "www.example.com"],
    "signatureAlgorithm": "SHA256withRSA",
    "publicKeyInfo": {
      "algorithm": "RSA",
      "size": 2048
    },
    "ctLogs": [
      {
        "logOperator": "Google",
        "timestamp": "2024-01-01T00:00:00Z",
        "signatureValid": true
      }
    ]
  },
  "dateValid": true,
  "keyUsageValid": true,
  "chainValid": true,
  "ctValid": true,
  "ocspStatus": {
    "status": "good",
    "thisUpdate": "2024-01-01T00:00:00Z",
    "nextUpdate": "2024-01-02T00:00:00Z"
  },
  "timestamp": "2024-01-01T12:00:00Z",
  "error": null
}
```

### Validation en Masse

#### Requête
`POST /api/v1/validate/bulk`

```json
{
  "domains": ["example.com", "example.org"],
  "options": {
    "checkOCSP": true,
    "checkCT": true
  }
}
```

### Métriques

#### Requête
`GET /api/v1/metrics`

#### Réponse
Format Prometheus

### Santé

#### Requête
`GET /api/v1/health`

#### Réponse
```json
{
  "status": "healthy",
  "components": {
    "validator": "up",
    "redis": "up",
    "mongodb": "up"
  },
  "uptime": 123456
}
```

## WebSocket API

### Connexion
```javascript
ws://api/v1/ws
```

### Messages

#### Souscription aux Événements
```json
{
  "type": "subscribe",
  "events": ["validation", "alert", "metrics"]
}
```

#### Événement de Validation
```json
{
  "type": "validation",
  "data": {
    "domain": "example.com",
    "result": { ... }
  }
}
```

#### Alerte
```json
{
  "type": "alert",
  "data": {
    "level": "warning",
    "message": "Certificate expiring soon",
    "details": { ... }
  }
}
```

## Gestion des Erreurs

### Codes d'Erreur
- `INVALID_INPUT` : Entrée invalide
- `NETWORK_ERROR` : Erreur réseau
- `CERT_ERROR` : Erreur de certificat
- `TIMEOUT_ERROR` : Timeout
- `OCSP_ERROR` : Erreur OCSP
- `INTERNAL_ERROR` : Erreur interne

### Format d'Erreur
```json
{
  "error": {
    "code": "CERT_ERROR",
    "message": "Invalid certificate chain",
    "details": { ... }
  }
}
```