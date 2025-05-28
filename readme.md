# ComptaDZ - MVP (2 mois)

## À propos

**ComptaDZ** est une solution SaaS cloud conçue pour les **PME algériennes**, destinée à **automatiser la comptabilité** : saisie de factures (OCR ou manuel), génération d'écritures IFRS, déclarations fiscales et états financiers.

### Objectifs du MVP (2 mois)

* **Double flux de saisie** : import PDF/OCR + formulaire manuel
* **Plan comptable 10 classes IFRS/PCN** avec classification intelligente IA
* **Génération automatique** d'écritures comptables IFRS conformes
* **Classification automatique** des écritures via OCR + IA
* **Déclarations fiscales** (TVA mensuelle, TAP, IBS annuelle)
* **États financiers** : bilan IFRS et compte de résultat par classe
* **Recherche & filtres** intelligents par classe et compte
* **Multi-utilisateurs** (Admin, Comptable, Assistant)
* **Validation de conformité IFRS** automatisée

### Stack Technologique

* **Frontend** : React + Vite + TailwindCSS
* **Backend** : Node.js + Express + TypeScript
* **Base de données** : PostgreSQL
* **OCR + IA** : Tesseract.js + preprocessing + classification intelligente
* **CI/CD** : GitHub Actions
* **Auth** : JWT + bcrypt

## Plan Comptable - 10 Classes IFRS/PCN Algérien

### Structure des classes comptables

| Classe | Description | Exemples de comptes |
|--------|-------------|-------------------|
| **1** | Comptes de capitaux | Capital social, réserves, report à nouveau |
| **2** | Comptes d'immobilisations | Terrains, constructions, matériel, logiciels |
| **3** | Comptes de stocks | Matières premières, produits finis, marchandises |
| **4** | Comptes de tiers | Clients, fournisseurs, TVA, organismes sociaux |
| **5** | Comptes financiers | Banques, caisse, placements, emprunts |
| **6** | Comptes de charges | Achats, services, salaires, amortissements |
| **7** | Comptes de produits | Ventes, prestations, produits financiers |
| **8** | Comptes spéciaux | Résultats exceptionnels, provisions |
| **9** | Comptes analytiques | Centres de coûts, sections analytiques |
| **10** | États financiers | Consolidation, comptes de groupe |

### Intelligence Artificielle et Classification

#### 🤖 Classification automatique des écritures
- **Reconnaissance intelligente** : L'IA analyse le libellé et suggère automatiquement la classe et le compte
- **Apprentissage adaptatif** : Plus vous utilisez le système, plus les suggestions deviennent précises
- **Validation IFRS** : Vérification automatique de la conformité des écritures

#### 📊 Exemples de classification IA
```
Facture "Électricité SONELGAZ" → Classe 6 (Charges) → Compte 6061 (Électricité)
Facture "Vente produit client ABC" → Classe 7 (Produits) → Compte 7011 (Ventes)
Achat "Ordinateur portable" → Classe 2 (Immobilisations) → Compte 2183 (Matériel informatique)
```

## Installation et démarrage

### Prérequis

* Node.js 18+
* PostgreSQL
* Git

### Variables d'environnement

#### Backend (api/.env)
```bash
# Base de données
DATABASE_URL="postgresql://username:password@localhost:5432/comptadz"

# JWT
JWT_SECRET="votre-secret-jwt-tres-securise"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV="development"

# OCR + IA
TESSERACT_LANG="ara+fra+eng"
AI_CLASSIFICATION_ENABLED="true"
```

#### Frontend (ui/.env)
```bash
VITE_API_URL="http://localhost:3000/api"
```

### Installation

1. **Cloner le dépôt**

   ```bash
   git clone https://github.com/charaf667/ComptA-DZ.git
   cd ComptA-DZ
   ```

2. **Installer les dépendances du backend**

   ```bash
   cd api
   npm install
   ```

3. **Configurer la base de données**

   ```bash
   cp .env.example .env
   # Éditer le fichier .env avec les informations de connexion à la base de données
   
   # Initialisation du plan comptable 10 classes
   npm run db:migrate
   npm run db:seed:chart-accounts
   ```

4. **Installer les dépendances du frontend**

   ```bash
   cd ../ui
   npm install
   ```

### Démarrage

1. **Démarrer le backend**

   ```bash
   cd api
   npm run dev
   ```

2. **Démarrer le frontend**

   ```bash
   cd ui
   npm run dev
   ```

## Structure du projet

```
/
├── api/                # Backend Node.js + Express + TypeScript
│   ├── prisma/         # Schéma et migrations Prisma
│   │   ├── seeds/        # Données initiales (plan comptable)
│   │   └── migrations/   # Migrations base de données
│   ├── src/            # Code source du backend
│   │   ├── config/       # Configuration
│   │   ├── controllers/  # Contrôleurs
│   │   │   ├── chart-accounts.controller.ts
│   │   │   ├── ai-classification.controller.ts
│   │   │   └── ifrs-validation.controller.ts
│   │   ├── middlewares/  # Middlewares
│   │   ├── models/       # Modèles
│   │   ├── routes/       # Routes
│   │   ├── services/     # Services
│   │   │   ├── ocr.service.ts
│   │   │   ├── ai-classification.service.ts
│   │   │   └── ifrs-compliance.service.ts
│   │   └── utils/        # Utilitaires
│   └── package.json    # Dépendances backend
├── ui/                 # Frontend React + Vite + TailwindCSS
│   ├── src/            # Code source du frontend
│   │   ├── components/   # Composants réutilisables
│   │   │   ├── ChartAccounts/     # Gestion plan comptable
│   │   │   ├── AIClassification/  # Interface classification IA
│   │   │   └── IFRSValidation/    # Validation conformité
│   │   ├── pages/        # Pages
│   │   │   ├── ChartAccounts.tsx
│   │   │   ├── JournalEntries.tsx
│   │   │   └── FinancialReports.tsx
│   │   └── services/     # Services API
│   │       ├── chart-accounts.service.ts
│   │       └── ai-classification.service.ts
│   └── package.json    # Dépendances frontend
├── docs/               # Documentation
│   ├── chart-accounts/ # Plan comptable détaillé
│   ├── api/           # Documentation API
│   └── screenshots/   # Captures d'écran
├── .github/           # Configuration GitHub Actions
├── PROGRESS.md        # Suivi d'avancement
├── PLANDEV.md         # Plan de développement détaillé
├── TODO.md           # Liste des tâches
└── README.md         # Documentation principale
```

## API Documentation

### Endpoints Plan Comptable & IA

#### Plan Comptable
- `GET /api/chart-accounts` - Liste des comptes par classe
- `GET /api/chart-accounts/class/:classId` - Comptes d'une classe spécifique
- `POST /api/chart-accounts` - Créer un nouveau compte
- `PUT /api/chart-accounts/:id` - Modifier un compte

#### Classification IA
- `POST /api/ai/classify-entry` - Classification automatique d'une écriture
- `POST /api/ai/suggest-account` - Suggestion de compte basée sur le libellé
- `GET /api/ai/learning-stats` - Statistiques d'apprentissage IA

#### Validation IFRS
- `POST /api/ifrs/validate-entry` - Validation conformité IFRS
- `GET /api/ifrs/compliance-report` - Rapport de conformité
- `POST /api/ifrs/generate-financial-statements` - États financiers IFRS

## Workflow de développement

* **Branche `main`** : code stable de production
* **Branche `dev`** : développement quotidien

```bash
# Développement sur la branche dev
git checkout dev

# Créer une nouvelle fonctionnalité
git checkout -b feature/ai-classification

# Fusionner dans dev une fois terminé
git checkout dev
git merge feature/ai-classification
```

## Tests

### Tests IA et Classification
```bash
cd api
npm run test:ai           # Tests classification IA
npm run test:ifrs         # Tests validation IFRS
npm run test:chart        # Tests plan comptable
```

## Déploiement

### Docker (Recommandé)
```bash
# Build et démarrage complet avec plan comptable
docker-compose up -d
docker-compose exec api npm run db:seed:chart-accounts
```

## État d'avancement

Consulter le fichier [PROGRESS.md](./PROGRESS.md) pour voir l'état d'avancement détaillé du projet.

## Plan de développement

Consulter le fichier [PLANDEV.md](./PLANDEV.md) pour voir le plan de développement détaillé avec les sprints.

---

**Développé par** : Charaf  
**Conformité** : IFRS + Plan Comptable National Algérien