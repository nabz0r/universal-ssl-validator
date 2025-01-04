# API Reference

## Core API

```mermaid
classDigram
    class SSLValidator {
        +create(domain: string)
        +createWithOptions(options: ValidatorOptions)
        +validate(certificate: Certificate)
        +analyze(certificate: Certificate)
    }

    class Certificate {
        +data: Buffer
        +format: string
        +metadata: object
    }

    class ValidationResult {
        +isValid: boolean
        +expirationDate: Date
        +securityScore: number
        +recommendations: string[]
    }
```

## Usage Examples

```typescript
// Basic usage
const validator = await SSLValidator.create('example.com');

// Advanced configuration
const validator = await SSLValidator.createWithOptions({
    domain: 'example.com',
    provider: 'letsencrypt',
    securityLevel: 'high',
    monitoring: true
});
```