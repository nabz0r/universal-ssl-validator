# Support IoT

## Vue d'ensemble
Intégration des appareils IoT pour la gestion et la validation des certificats SSL.

## Protocol Adapters

### Protocoles Supportés
- MQTT
  - Pub/Sub messaging
  - QoS configurable (0,1,2)
  - TLS/SSL sécurisé
  - Authentification
  - Keep-alive
  - Clean session
  - Last Will Testament

- CoAP
  - Communication UDP légère
  - Observe pattern
  - Découverte de ressources
  - DTLS sécurisé
  - Multicast support
  - Block-wise transfer

### Configuration

```typescript
// Configuration MQTT
const mqttConfig: AdapterConfig = {
  host: 'broker.example.com',
  port: 8883,
  clientId: 'device-001',
  tls: {
    cert: fs.readFileSync('cert.pem'),
    key: fs.readFileSync('key.pem'),
    ca: [fs.readFileSync('ca.pem')],
    rejectUnauthorized: true
  }
};

// Configuration CoAP
const coapConfig: AdapterConfig = {
  host: 'coap.example.com',
  port: 5684,
  clientId: 'device-002',
  tls: {
    cert: fs.readFileSync('cert.pem'),
    key: fs.readFileSync('key.pem')
  }
};
```

## Device Registry

```typescript
// Enregistrement device
const device = await registry.register({
  id: 'device-001',
  type: 'sensor',
  protocols: ['mqtt'],
  certificates: {
    device: 'device-cert.pem',
    ca: 'ca-cert.pem'
  }
});

// Monitoring device
device.on('status', (status) => {
  console.log('Device status:', status);
});

device.on('cert-expiring', (days) => {
  console.log(`Certificate expires in ${days} days`);
});
```

## Fleet Management

### Configuration des Flottes
```typescript
const fleet = await fleetManager.createFleet({
  id: 'fleet-001',
  name: 'Production Sensors',
  tags: ['prod', 'sensors'],
  devices: [],
  config: {
    updatePolicy: {
      automatic: true,
      timeWindow: { start: '02:00', end: '04:00' },
      batchSize: 10,
      failureThreshold: 0.1
    },
    certRotation: {
      enabled: true,
      daysBeforeExpiry: 30,
      staggered: true
    },
    monitoring: {
      healthCheckInterval: 300000,
      metricsInterval: 60000,
      alertThresholds: {
        errorRate: 0.05,
        latency: 1000
      }
    }
  }
});

// Ajout de devices à la flotte
await fleetManager.addDeviceToFleet('fleet-001', 'device-001');

// Mise à jour de la configuration
await fleetManager.updateFleetConfig('fleet-001', {
  certRotation: {
    daysBeforeExpiry: 45
  }
});
```

### Monitoring de Flotte
```typescript
// Métriques automatiques
metrics.gauge('fleet_devices_total', fleet.devices.length);
metrics.gauge('fleet_devices_connected', connectedCount);
metrics.gauge('fleet_cert_days_avg', avgCertDays);

// Santé de la flotte
fleet.on('health-check', (stats) => {
  console.log('Fleet health:', stats);
});

fleet.on('cert-rotation', (device) => {
  console.log('Certificate rotated for:', device.id);
});
```

## Sécurité

### Authentification
- Mutual TLS obligatoire
- Rotation automatique certificats
- Vérification origine device
- Blacklist devices compromis

### Chiffrement
- TLS 1.3 minimum
- Chiffrement bout-en-bout
- Perfect Forward Secrecy
- Cipher suites sécurisées

### Monitoring
- Détection anomalies
- Alertes intrusion
- Logs sécurité
- Audit trail

## Métriques

### Device Stats
```typescript
metrics.gauge('devices_connected', registry.connectedCount());
metrics.gauge('devices_registered', registry.totalCount());
metrics.gauge('cert_days_remaining', device.certValidDays());
```

### Protocoles
```typescript
metrics.counter('mqtt_messages_received');
metrics.counter('mqtt_messages_sent');
metrics.histogram('mqtt_message_size');
metrics.gauge('mqtt_connection_errors');
```

### Fleet Stats
```typescript
metrics.gauge('fleet_error_rate');
metrics.gauge('fleet_cert_rotations');
metrics.histogram('fleet_update_duration');
metrics.counter('fleet_alerts_total');
```

## Configuration
```yaml
iot:
  mqtt:
    port: 8883 
    persistence: true
    qos: 1
    keepalive: 60

  coap:
    port: 5684
    multicast: true
    blockSize: 1024

  fleet:
    maxDevices: 1000
    updateBatchSize: 10
    healthCheckInterval: 300

  security:
    tls:
      minVersion: TLSv1.3
      cipherSuites:
        - TLS_AES_256_GCM_SHA384
        - TLS_CHACHA20_POLY1305_SHA256
      certRotation: 30 # days

  monitoring:
    metricsInterval: 60
    anomalyDetection: true
    retentionDays: 90
```