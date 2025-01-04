# Core Module

Core validation logic and certificate processing.

## Components
- Certificate validator
- Chain validator
- Format converter
- Error handling

## Usage
```typescript
import { CertificateValidator } from '../core';

const validator = new CertificateValidator();
const result = await validator.validate(cert);
```