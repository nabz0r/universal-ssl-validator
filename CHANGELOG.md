# Changelog

## [1.0.0] - 2024-01-06

### Added
- Validation complète des certificats SSL
  - Support TLS 1.2/1.3
  - OCSP Stapling
  - CT Logs (RFC 6962)
  - DANE/TLSA (RFC 6698)
- IoT Support
  - MQTT & CoAP adapters
  - Device Registry
  - Fleet Management
  - Certificate Auto-Rotation
- Sécurité
  - Rate Limiting
  - Input Validation
  - TLS Hardening
  - Error Handling

### Changed
- Amélioration des performances de validation
- Optimisation du cache Redis
- Standardisation des codes d'erreur

### Removed
- Support TLS 1.0/1.1 obsolète
- Legacy certificate formats

## [0.9.0] - 2023-12-15

### Added
- Core SSL Validation Engine
- Certificate Chain Validation
- OCSP Integration basique
- Input Validation & Sanitization
- Logging système

### Changed
- Refactoring du code legacy
- Mise à jour des dépendances