# Plan de Développement ComptaDZ - MVP 2 mois

## 🎯 Vision MVP
Créer une solution SaaS comptable automatisée pour PME algériennes avec **plan comptable 10 classes IFRS/PCN** et **classification intelligente par IA**.

## 📅 Plan de développement détaillé

### Sprint 1 (Semaines 1-2) - Fondations + Plan Comptable
- [x] Setup monorepo, Docker Postgres, GitHub Actions
- [x] Authentification (signup/login, JWT)
- [x] Dashboard de base & multi-tenant schema
- [x] Structure modulaire backend (MVC)
- [x] Configuration Git (branches main/dev)
- [x] Initialisation frontend (React + Vite + TailwindCSS)
- [x] Structure frontend (composants, pages, services, contextes)
- [x] Système d'authentification frontend (login, register, forgot password)
- [x] Contexte d'authentification et services API
- [ ] **Implémentation plan comptable 10 classes**
  - [ ] Modèles Prisma pour les 10 classes
  - [ ] Seeding des comptes standards IFRS/PCN
  - [ ] API REST pour gestion plan comptable
  - [ ] Interface UI pour visualiser/modifier plan comptable

### Sprint 2 (Semaines 3-4) - Factures + Classification IA
- [x] UI Frontend pour gestion des factures (liste, filtres, recherche)
- [x] Dashboard avec statistiques et aperçu des factures
- [x] Page de profil utilisateur
- [x] Layout principal avec navigation et sidebar
- [ ] **Module Factures Hybride : OCR + form manuel**
  - [ ] Upload PDF + preprocessing
  - [ ] Extraction OCR (date, montant, TVA, libellé)
  - [ ] Formulaire manuel de saisie
- [ ] **Classification intelligente IA**
  - [ ] Service IA pour classification automatique
  - [ ] Suggestion de comptes basée sur libellé
  - [ ] Interface de validation/correction utilisateur
- [ ] **Recherche & filtres avancés**
  - [ ] Filtres par classe comptable
  - [ ] Recherche full-text sur libellés
  - [ ] Filtres par dates, montants, statuts

### Sprint 3 (Semaines 5-6) - Écritures IFRS + Validation
- [ ] **Génération automatique d'écritures IFRS**
  - [ ] Moteur d'écritures basé sur les 10 classes
  - [ ] Gestion multi-taxes (TVA, TAP)
  - [ ] Validation double-partie automatique
  - [ ] Gestion amortissements (classe 2)
- [ ] **Validation de conformité IFRS**
  - [ ] Règles de validation par classe
  - [ ] Vérification cohérence écritures
  - [ ] Alertes non-conformités
  - [ ] Rapport de conformité IFRS
- [ ] **Workflow validation utilisateurs**
  - [ ] Assistant → Comptable → Chef
  - [ ] Statuts d'approbation
  - [ ] Historique des modifications
- [ ] **UI Frontend pour écritures comptables**
  - [ ] Journal des écritures avec filtres par classe
  - [ ] Formulaire de saisie manuelle
  - [ ] Validation temps réel IFRS

### Sprint 4 (Semaines 7-8) - États Financiers + Fiscalité
- [ ] **États financiers IFRS par classe**
  - [ ] Bilan comptable (classes 1-5)
  - [ ] Compte de résultat (classes 6-7)
  - [ ] Tableau des flux de trésorerie
  - [ ] Export PDF/Excel des états
- [ ] **Module déclarations fiscales**
  - [ ] Déclaration TVA mensuelle automatisée
  - [ ] Calcul TAP (Taxe sur l'Activité Professionnelle)
  - [ ] Préparation IBS (Impôt sur les Bénéfices des Sociétés)
  - [ ] Export formats officiels DGI
- [ ] **Dashboard avancé & KPIs**
  - [ ] Indicateurs financiers par classe
  - [ ] Graphiques évolution charges/produits
  - [ ] Alertes échéances fiscales
  - [ ] Analyse comparative périodes
- [ ] **UI Frontend états & fiscalité**
  - [ ] Pages états financiers avec drill-down
  - [ ] Module déclarations fiscales
  - [ ] Calendrier fiscal algérien

## ✔️ Quick wins à ajouter

### Sprint 2.5 (Fonctionnalités bonus)
- [ ] **Import relevés bancaires CSV**
  - [ ] Parser formats banques algériennes
  - [ ] Rapprochement automatique
  - [ ] Suggestion écritures bancaires
- [ ] **Pièces jointes & commentaires**
  - [ ] Upload documents justificatifs
  - [ ] Commentaires sur écritures
  - [ ] Historique des modifications
- [ ] **Alertes in-app échéances fiscales**
  - [ ] Calendrier fiscal DZ
  - [ ] Notifications push
  - [ ] Rappels automatiques
- [x] **Thème clair/sombre** (implémenté avec variables CSS)
- [x] **Page d'accueil** pour présentation du produit
- [x] **Structure de routage** avec protection des routes

## 🧠 Composants IA détaillés

### 1. Classification automatique d'écritures
```typescript
// Exemple de classification
interface AIClassification {
  confidence: number;      // 0-100%
  suggestedClass: number;  // 1-10
  suggestedAccount: string; // ex: "6061"
  reasoning: string;       // Explication
}

// Cas d'usage
"Facture SONELGAZ Électricité 25000 DA" 
→ Classe 6 (Charges), Compte 6061 (Électricité), 95% confiance
```

### 2. Apprentissage adaptatif
- **Feedback utilisateur** : correction = amélioration modèle
- **Patterns entreprise** : apprend les habitudes comptables spécifiques
- **Historique** : utilise les écritures passées pour suggestions

### 3. Validation IFRS intelligente
- **Règles métier** : vérification automatique normes IFRS
- **Cohérence** : détection incohérences entre classes
- **Suggestions** : propositions d'amélioration conformité

## 🏗️ Architecture technique IA

### Backend Services
```
/src/services/ai/
├── classification.service.ts    # Classification écritures
├── learning.service.ts         # Apprentissage adaptatif  
├── ifrs-validation.service.ts  # Validation IFRS
├── pattern-recognition.service.ts # Reconnaissance patterns
└── suggestion.service.ts       # Moteur suggestions
```

### Base de données IA
```sql
-- Table apprentissage IA
CREATE TABLE ai_classifications (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id),
  libelle TEXT,
  suggested_class INT,
  suggested_account VARCHAR(10),
  user_correction JSONB,
  confidence_score DECIMAL,
  created_at TIMESTAMP
);

-- Table patterns comptables
CREATE TABLE accounting_patterns (
  id SERIAL PRIMARY KEY, 
  company_id INT REFERENCES companies(id),
  pattern_type VARCHAR(50),
  keywords TEXT[],
  class_id INT,
  account_code VARCHAR(10),
  frequency INT DEFAULT 1
);
```

## 📊 État d'avancement global

| Composant | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 | Total |
|-----------|----------|----------|----------|----------|-------|
| **Backend API** | 35% | +25% | +25% | +15% | 100% |
| **Frontend UI** | 60% | +20% | +15% | +5% | 100% |
| **Plan Comptable** | 5% | +45% | +35% | +15% | 100% |
| **IA Classification** | 0% | +60% | +30% | +10% | 100% |
| **États IFRS** | 0% | +10% | +40% | +50% | 100% |
| **Module Fiscal** | 0% | +5% | +25% | +70% | 100% |
| **DevOps/CI** | 90% | +5% | +3% | +2% | 100% |
| **Documentation** | 45% | +25% | +20% | +10% | 100% |

## 🎯 Objectifs de livraison

### Fin Sprint 2 (Semaine 4)
- ✅ **Demo factures** : Upload PDF → OCR → Classification IA → Suggestion compte
- ✅ **Plan comptable** fonctionnel avec les 10 classes
- ✅ **Interface** : saisie manuelle + validation automatique

### Fin Sprint 3 (Semaine 6) 
- ✅ **Écritures IFRS** : génération automatique conformes
- ✅ **Validation** : moteur de contrôle IFRS complet
- ✅ **Workflow** : circuit d'approbation opérationnel

### Fin Sprint 4 (Semaine 8) - MVP Complet
- ✅ **États financiers** : bilan + compte résultat exportables
- ✅ **Fiscalité DZ** : TVA + TAP + IBS automatisés
- ✅ **Production** : déploiement cloud opérationnel

## 🚀 Roadmap post-MVP (mois 3-6)

### Phase 2 - Optimisation & Intégrations
- **API comptable** : intégration logiciels tiers
- **Mobile app** : application React Native
- **Reporting avancé** : analytics prédictives
- **Multi-devises** : support Euro/Dollar
- **Conformité audit** : piste d'audit complète

### Phase 3 - Intelligence & Automatisation  
- **IA prédictive** : prévisions flux trésorerie
- **OCR avancé** : reconnaissance écritures manuscrites
- **Intégration bancaire** : APIs banques algériennes
- **Chatbot comptable** : assistant IA conversationnel

---

**Dernière mise à jour** : 28/05/2025  
**Chef de projet** : Charaf  
**Objectif MVP** : 28/07/2025