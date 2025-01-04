# Guide CLI

## 🛠️ Installation

```bash
npm install -g universal-ssl-validator
```

## 🚀 Commandes Disponibles

### Validation Rapide
```bash
ssl-validator check example.com
```

### Assistant Interactif
```bash
ssl-validator wizard
```
L'assistant vous guidera à travers :
- Choix du domaine
- Sélection du provider
- Configuration de la sécurité
- Options de monitoring

### Gestion des Certificats
```bash
# Liste des certificats
ssl-validator manage --list

# Renouvellement
ssl-validator manage --renew example.com

# Suppression
ssl-validator manage --delete example.com
```

## 🎨 Exemples d'Utilisation

```bash
# Validation avec provider spécifique
ssl-validator check example.com --provider letsencrypt

# Validation avec monitoring
ssl-validator check example.com --monitoring
```

## 🌈 Retours Visuels

- ✅ Succès en vert
- ⚠️ Avertissements en jaune
- ❌ Erreurs en rouge
- 📊 Métriques en cyan
