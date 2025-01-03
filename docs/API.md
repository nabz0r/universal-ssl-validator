# API Documentation

## Endpoints

### Validation de Certificat
`POST /api/v1/certificates/validate`

Valide un certificat SSL avec analyse IA.

**Request Body:**
```json
{
    "certificate": "base64_encoded_certificate",
    "format": "PEM|JKS|PKCS12"
}
```

**Response:**
```json
{
    "validation": {
        "isValid": true,
        "expirationDate": "2025-01-03T18:35:51Z",
        "issuer": "CN=Example CA",
        "subject": "CN=example.com"
    },
    "security": {
        "score": 0.95,
        "riskLevel": "LOW",
        "recommendations": [
            "Le certificat utilise des algorithmes modernes",
            "La longueur de clé est appropriée"
        ]
    },
    "energy": {
        "consumption": "0.05kWh",
        "carbonFootprint": "0.025kg CO2"
    }
}
```

### Déploiement Cloud
`POST /api/v1/cloud/certificates`

Déploie des certificats sur différents providers cloud.

**Request Body:**
```json
{
    "provider": "AWS|GCP|Azure",
    "region": "eu-west-1",
    "certificates": [
        {
            "name": "prod-cert",
            "data": "base64_encoded_certificate"
        }
    ]
}
```

### Monitoring Énergétique
`GET /api/v1/monitoring/energy`

Récupère les métriques de consommation énergétique.

**Response:**
```json
{
    "current": {
        "cpuUsage": 45.2,
        "memoryUsage": 62.8,
        "operationsPerWatt": 1250,
        "totalEnergyConsumption": 0.12,
        "carbonFootprint": 0.06
    },
    "historical": {
        "daily": [...],
        "weekly": [...],
        "monthly": [...]
    },
    "recommendations": [
        "Passage en mode ECO recommandé aux heures creuses",
        "Optimisation du cache conseillée"
    ]
}
```

## Gestion des Erreurs

Les erreurs sont retournées au format suivant :
```json
{
    "error": "Description de l'erreur",
    "code": "ERROR_CODE",
    "details": {}
}
```

Codes d'erreur communs :
- `VALIDATION_ERROR`: Erreur de validation de certificat
- `CLOUD_DEPLOYMENT_ERROR`: Erreur de déploiement cloud
- `MODEL_UPDATE_ERROR`: Erreur de mise à jour du modèle IA