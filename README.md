# Universal SSL Validator

Un système moderne et modulaire de validation SSL, conçu pour être extensible et performant.

## Architecture

Le système est construit autour d'une architecture modulaire composée de :

### Core System (Système Central)
- Validation SSL de base
- Gestion des plugins
- Cache intelligent
- Système de métriques

### Plugins Disponibles
- Java Keystore Plugin : Validation complète des certificats JKS et PKCS12
- Python SSL Plugin : Validation avancée utilisant la bibliothèque SSL de Python

## Installation

```bash
npm install universal-ssl-validator
```

## Utilisation Rapide

```typescript
import { UniversalSSLValidator } from 'universal-ssl-validator';

const validator = new UniversalSSLValidator();

// Validation simple
const result = await validator.validateCertificate(certBuffer, 'JKS');

// Validation de chaîne
const chainResult = await validator.validateCertificateChain(certChainBuffers, 'PEM');
```

## Documentation Détaillée
Consultez le dossier `/docs` pour la documentation complète :
- Architecture détaillée
- Guide des plugins
- Spécifications techniques
- Guide de contribution

## Contribution
Les contributions sont les bienvenues ! Consultez CONTRIBUTING.md pour les détails.

## Licence
MIT