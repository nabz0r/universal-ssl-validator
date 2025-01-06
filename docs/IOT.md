{EXISTING CONTENT}

## Advanced Features

### Certificate Rotation
```typescript
// Configuration
const rotator = new CertificateRotator({
  staggered: true,
  daysBeforeExpiry: 30,
  validityPeriod: 365,
  renewalBatchSize: 10,
  renewalWindow: {
    start: '02:00',
    end: '04:00'
  }
});

// Auto-rotation
await rotator.queueRotation(device);
```

### Fleet Orchestration
```typescript
// Gestion de flotte
const fleet = await fleetManager.createFleet({
  id: 'fleet-001',
  name: 'Production Sensors',
  config: {
    updatePolicy: { /* ... */ },
    certRotation: { /* ... */ },
    monitoring: { /* ... */ }
  }
});

// Métriques
metrics.gauge('fleet_devices', fleet.devices.length);
metrics.gauge('fleet_certs_valid', validCount);
```

{rest of existing content...}