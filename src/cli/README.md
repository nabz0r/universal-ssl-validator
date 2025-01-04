# Module CLI

## Structure

```
cli/
├── index.ts      # Point d'entrée CLI
├── prompts.ts    # Interface interactive
└── types.ts      # Types et interfaces
```

## Utilisation dans le Code

```typescript
import { CLI } from './cli';

const cli = new CLI();
cli.start(process.argv);
```

## Features
- Interface Commander.js
- Prompts interactifs
- Gestion des erreurs
- Retours visuels
