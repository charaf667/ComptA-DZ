# ComptaDZ - MVP (2 mois)

## 📖 README

**ComptaDZ** est une solution SaaS cloud conçue pour les **PME algériennes**, destinée à **automatiser la comptabilité** : saisie de factures (OCR ou manuel), génération d’écritures IFRS, déclarations fiscales et états financiers.

### 🎯 Objectifs du MVP (2 mois)

* **Double flux de saisie** : import PDF/OCR + formulaire manuel
* **Génération automatique** d’écritures comptables IFRS (plan 5 classes)
* **Déclarations fiscales** (TVA mensuelle, TAP, IBS annuelle)
* **États financiers** : bilan IFRS et compte de résultat
* **Recherche & filtres** pour retrouver facilement les factures
* **Multi-utilisateurs** (Admin, Comptable, Assistant)

### 🛠️ Stack Technologique

* **Frontend** : React + Vite + TailwindCSS
* **Backend** : Node.js + Express + TypeScript
* **Base de données** : PostgreSQL (hosté sur Render/Supabase)
* **OCR** : Tesseract.js + préprocessing
* **CI/CD & Hébergement** : GitHub Actions + Render
* **Auth** : JWT + bcrypt

### 🚀 Comment contribuer

1. **Fork** le dépôt et clone :

   ```bash
   git clone https://github.com/ton-orga/comptadz-mvp.git
   ```
2. **Branches** :

   * `main` : code de production
   * `dev` : développement quotidien
3. **Structure** :

   * `/ui` : code React
   * `/api` : code Node.js
   * `/migrations` : scripts de migration DB
4. **Installer & lancer** :

   ```bash
   # backend
   cd api && npm install && npm run dev
   # frontend
   cd ui && npm install && npm run dev
   # base de données
   docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=pass postgres
   ```
5. **CI/CD** : chaque PR déclenche des tests et un build automatique via GitHub Actions.

---

## 📅 Plan de développement détaillé

### Sprint 1 (Semaines 1-2) - Fondations

* Setup monorepo, Docker Postgres, GitHub Actions
* Authentification (signup/login, JWT)
* Dashboard de base & multi-tenant schema

### Sprint 2 (Semaines 3-4) - Factures & Recherche

* Module Factures Hybride : OCR + form manuel
* Extraction OCR (date, montant, TVA)
* Recherche & filtres (n° facture, fournisseur, date, statut, type)

### Sprint 3 (Semaines 5-6) - Plan Comptable & Écritures

* Implémentation plan IFRS 5 classes
* Moteur génération écritures IFRS multi-taxes
* Workflow validation (assistant → comptable → chef)

### Sprint 4 (Semaines 7-8) - États Financiers & Fisc

* Génération bilan et compte de résultat IFRS
* Module déclarations fiscales (TVA, TAP, IBS)
* Dashboard activités & KPIs

### ✔️ Quick wins à ajouter

* Import relevés bancaires CSV
* Pièces jointes & commentaires
* Alertes in-app échéances fiscales
* Thème clair/sombre

---

**Prêt pour le développement ?** Ajoute des issues sur GitHub et commence avec le Sprint 1 !
