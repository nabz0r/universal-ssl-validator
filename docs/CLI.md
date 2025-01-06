# Guide CLI

## Installation

```bash
npm install -g universal-ssl-validator
```

## Commandes

### Validation SSL
```bash
# Validation simple
ssl-validator validate example.com

# Options complètes
ssl-validator validate example.com \
  --ocsp      # Vérification OCSP \
  --ct        # Certificate Transparency \
  --dane      # Vérification DANE/TLSA \
  --format json
```

### Gestion IoT

#### Devices
```bash
# Lister les devices
ssl-validator device list
ssl-validator device list --type sensor --status connected

# Enregistrer un device
ssl-validator device register \
  --id device-001 \
  --type sensor \
  --cert /path/to/cert.pem \
  --ca /path/to/ca.pem

# Supprimer un device
ssl-validator device remove device-001
```

#### Flottes
```bash
# Créer une flotte
ssl-validator fleet create \
  --name "Production Sensors" \
  --tags prod,sensors

# Ajouter un device
ssl-validator fleet add-device \
  --fleet fleet-001 \
  --device device-001

# Configurer rotation certificats
ssl-validator fleet config fleet-001 \
  --cert-rotation.enabled true \
  --cert-rotation.days 30
```

## Monitoring
```bash
# Statut devices
ssl-validator status devices

# Métriques flottes
ssl-validator status fleet fleet-001
```

## Configuration

### Format config.yml
```yaml
validator:
  ocsp:
    enabled: true
    timeout: 5000
  ct:
    enabled: true
    minLogs: 2
  dane:
    enabled: true

iot:
  protocols:
    mqtt:
      port: 8883
      tls: true
    coap:
      port: 5684
      dtls: true
      
  fleet:
    maxDevices: 1000
    certRotation:
      enabled: true
      daysBeforeExpiry: 30
```

## Exemples

### Pipeline CI/CD
```bash
# Validation automatique
ssl-validator validate $DOMAIN --format json > result.json

# Vérification flotte
ssl-validator fleet verify fleet-001 --threshold 90
```

### Scripts
```bash
# Rotation certificats
ssl-validator fleet rotate-certs fleet-001

# Monitoring 
ssl-validator monitor --config monitor.yml
```

## Options Globales

```
  -v, --verbose       Mode verbeux
  -q, --quiet         Mode silencieux
  -c, --config        Fichier config
  -f, --format        Format sortie (json|table)
  -h, --help          Aide
```

## Codes Retour

```
0   Succès
1   Erreur générale
2   Erreur validation
3   Erreur configuration
4   Erreur réseau
5   Timeout
```

## Environment

```bash
SSL_VALIDATOR_CONFIG   # Fichier config
SSL_VALIDATOR_TOKEN    # Token API
SSL_VALIDATOR_DEBUG    # Mode debug
```

## Best Practices

### Automation
```bash
# Validation batch
cat domains.txt | xargs -I {} ssl-validator validate {}

# Monitoring
watch -n 300 'ssl-validator status fleet-001'
```

### Sécurité
```bash
# Validation sécurisée
ssl-validator validate example.com \
  --ocsp \
  --ct \
  --dane \
  --tls-min 1.2
```