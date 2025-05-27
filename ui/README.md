# ComptaDZ - Frontend (UI)

## 📋 Description

Interface utilisateur de ComptaDZ, une solution SaaS cloud conçue pour les PME algériennes, destinée à automatiser la comptabilité : saisie de factures (OCR ou manuel), génération d'écritures IFRS, déclarations fiscales et états financiers.

## 🛠️ Stack Technologique

- **Framework** : React 18+
- **Build Tool** : Vite
- **Langage** : TypeScript
- **Styling** : TailwindCSS
- **État** : React Context API / React Query
- **Routing** : React Router
- **Tests** : Vitest + React Testing Library

## 🚀 Installation et démarrage

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
npm run dev

# Build pour la production
npm run build

# Lancer les tests
npm run test
```

## 📁 Structure du projet

```
/src
  /assets        # Images, fonts, etc.
  /components    # Composants réutilisables
  /contexts      # Contextes React (auth, theme, etc.)
  /hooks         # Custom hooks
  /layouts       # Layouts de page
  /pages         # Pages de l'application
  /services      # Services API
  /types         # Types TypeScript
  /utils         # Fonctions utilitaires
```

## 🔄 Workflow de développement

1. Travailler sur la branche `dev`
2. Créer des composants réutilisables
3. Tester localement
4. Commit et push vers GitHub
5. La CI/CD déploie automatiquement

## 🔗 Connexion avec le backend

L'application se connecte à l'API backend via des services API dans `/src/services`.
L'URL de base de l'API est configurée dans les variables d'environnement.
