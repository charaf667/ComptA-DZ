# ComptaDZ – Workflow Solo Dev

Ce guide décrit le socle de fiabilité minimal pour un développement fluide, sans équipe dédiée.

---

## 1. Branching & Commits
- **Branches courtes** : `feat/*`, `fix/*`, `refactor/*`.
- **Conventional Commits** pour générer automatiquement le CHANGELOG.
- **Pull-Request locale** : même en solo, ouvre une PR pour déclencher la CI avant merge sur `main`.

## 2. Pipeline CI (GitHub / GitLab)
```yaml
# .github/workflows/ci.yml
jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_USER: postgres
          POSTGRES_DB: comptadz_test
        ports: ["5432:5432"]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 8 }
      - run: pnpm install --frozen-lockfile
      - run: npx prisma migrate deploy
        env: { DATABASE_URL: postgresql://postgres:postgres@localhost:5432/comptadz_test }
      - run: pnpm test
        env: { DATABASE_URL: postgresql://postgres:postgres@localhost:5432/comptadz_test }
      - run: pnpm run lint
```

## 3. Scripts NPM utiles
| Script | Rôle |
|--------|------|
| `dev` | Démarre l’API avec ts-node-dev |
| `db:reset` | Drop + migrate + seed pour un environnement propre |
| `test` | Lance Jest en base test |
| `test:watch` | Watch mode Jest |

## 4. Jeu de données et Seeds
- `DEFAULT_TENANT_ID` dans `.env` pour éviter les IDs mouvants.
- Script seed crée : tenant, admin, plan comptable.
- Tests utilisent `tests/setup.ts` qui tronque `accounts` et upsert le tenant de test.

## 5. Tests « garde-fous » à écrire (priorité)
1. **Repositories** : isolation tenant (`AccountRepository`, futurs repos).
2. **Middleware d’auth** : refuse token sans tenant, ou expiré.
3. **Services Adaptatifs** :
   - `AdaptiveLearningService.suggestAccounts`
   - `updatePerformanceMetrics` (cast jsonb).
4. **Routes protégées** (supertest) :
   - `GET /api/performance-metrics` (200 / 401)
   - `POST /api/adaptive-learning/feedback`

> Objectif : ~20–30 % de couverture rapide pour prévenir les régressions majeures.

## 6. Feature Flags & Migrations
- Nouvelles features derrière `process.env.FEATURE_*`.
- `prisma migrate dev --create-only`, PR de revue avant déploiement.

## 7. Déploiement Staging
- Merge sur `main` ⇒ déploiement auto rendu/azure « staging ».
- DB isolée pour tester les flux réels SaaS.

## 8. Documentation vivante
- Mettre à jour **README**, **PROGRESS.md**, **CHANGELOG.md** et **PIVOTATION.md** à chaque PR.
- Dans `PIVOTATION.md` :
  - Section « Vision Cirta IT (clone) » : exigences copiées.
  - Section « Différenciateurs ComptaDZ » : IA, OCR, plan DZ.

## 9. Étapes à court terme (≤ 2 jours)

- ✅ **ESLint + Prettier** intégrés (`lint`, `lint:fix`, `format`).
- ✅ **Pipeline CI** opérationnelle (tests + lint + migrations).
- ✅ **Script `db:reset`** disponible.
- ✅ **Tests initiaux** : `AccountRepository` et `AdaptiveLearningService.suggestAccounts` verts.
- ✅ Tests middleware d’auth & routes protégées (supertest).
- ☐ Étendre la couverture (services OCR, feedback, performance-metrics).

1. Ajouter ESLint + Prettier et script `lint`.
2. Couvrir services clés par tests (voir §5).
3. Mettre en place la pipeline CI (voir §2).
4. Écrire script `db:reset`.
5. Compléter `PIVOTATION.md` avec roadmap SaaS.

## 10. Journal de progression
| Date | Sujet | Détails |
|------|-------|---------|
| 2025-06-24 | Infrastructure tests | Ajout de Jest, configuration TS, première suite verte (AccountRepository, AdaptiveLearning) |
| 2025-06-24 | Qualité code | ESLint + Prettier avec scripts npm, correction des warnings |
| 2025-06-24 | CI | Workflow GitHub Actions prêt, Postgres service, badge vert |
| 2025-06-24 | Types & mocks | Ajout de `src/types/ocr.ts`, `src/types/adaptive-learning.ts`, harmonisation des interfaces |
| 2025-06-24 | Documentation | DEV_WORKFLOW.md mis à jour, CHANGELOG enrichi |
| 2025-06-25 | Sécurité & tests | Ajout tests middleware d’auth (supertest), mock AdaptiveLearningService, suppression logs asynchrones |

---

## Plan d’actions – Été 2025

---

## Roadmap Cirta IT – Sprints (Objectif : 10 jours)

| Jour | Sprint / Module | Objectifs clés |
|------|-----------------|----------------|
| 1 | Initialisation & Setup | Finaliser l’architecture, CI/CD, scripts seed, doc technique, onboarding |
| 2 | Sécurité & Auth | Couverture complète des routes protégées, isolation multi-tenant, tests Jest/Supertest |
| 3 | Comptabilité cœur | CRUD comptes, plan comptable 10 classes, API IFRS/PCN, tests et seed |
| 4 | Classification IA | Moteur de suggestion, apprentissage adaptatif, intégration feedback, tests |
| 5 | OCR & Upload | Extraction hybride Poppler+Tesseract, endpoints upload, robustesse, tests |
| 6 | Facturation | Génération factures, suivi règlements, relances, intégration OCR, tests |
| 7 | Trésorerie | Prévisions, rapprochements bancaires, alertes, tests isolation |
| 8 | Reporting avancé | Tableaux de bord, exports multi-format, BI, tests |
| 9 | Notifications & Workflow | WebSocket, notifications temps réel, validation multi-niveaux, tests |
| 10 | Marketplace & Finalisation | Modules annexes, API publique, audit, doc Swagger, polish, démo |

**Règle : chaque sprint = code, tests, doc, démo**

### Sprint 1 – Détails (Jour 1) - **Terminé**

---

## Sprint 2 – Sécurité, RBAC & Qualité (10 jours)

| Jour | Objectif | Tâches |
|------|----------|--------|
| 1 | Kick-off & backlog | • Créer issues GitHub (security, tests, ui) <br>• Branches `feature/rbac-backend`, `feature/admin-role-ui`, `feature/fix-ts-ui` |
| 2 | RBAC backend ✅ | • Middleware rôles (Admin, Accountant, User) <br>• Tests 401/403 <br>• MAJ doc API |
| 3 | Isolation multi-tenant ✅ | • Vérif `tenantId` partout <br>• Tests d’isolation |
| 4 | Security headers & rate-limit | • `helmet`, `express-rate-limit` <br>• Tests Supertest 429 |
| 5 | Tests intégration | • Suites Supertest factures/OCR/suggestions <br>• Couverture 70 % |
| 6 | Couverture 80 % | • Tests services IA/OCR <br>• Badge coverage README |
| 7 | Admin Role UI | • Page `/admin/roles` (liste, edit) <br>• Guards Admin <br>• Service API roles |
| 8 | Fix TS UI | • Types manquants, `any`, hooks deps <br>• CI UI doit passer |
| 9 | QA & Docs | • Scan OWASP ZAP <br>• `SECURITY.md`, CHANGELOG |
| 10 | Buffer & Release | • Fix restes <br>• Tag `v0.2.0` <br>• Rétrospective |

**Livrables :** RBAC complet API+UI, isolation tenant, rate-limit, couverture ≥ 80 %, CI UI verte, docs sécurité.

| Tâche | Sous-tâches | Statut |
|-------|-------------|--------|
| CI/CD GitHub Actions | • Créer `.github/workflows/ci.yml`<br>• Services Postgres, install deps, migrate, tests, lint | [x] |
| Scripts seed | • Vérifier `init-db-with-accounts.ts` et `seed-demo-tenants.ts`<br>• Ajouter README sur utilisation | [x] |
| Environnement | • Créer `.env.example` avec variables (DB, JWT_SECRET)<br>• Documenter dans README | [x] |
| Qualité code | • Vérifier ESLint, Prettier configs<br>• Ajouter badge build & coverage placeholders | [x] |
| Documentation onboarding | • Rédiger section "Getting Started" dans README<br>• Mettre à jour `DEV_WORKFLOW.md` si besoin | [x] |

**Note** : Les erreurs TypeScript du frontend (20 erreurs, 10 warnings) seront corrigées dans un sprint dédié à l'amélioration UI (Sprint UI Planifié).

> Objectif : à la fin du Jour 1, le repo tourne en CI, seed DB et toutes les commandes `npm run` sont documentées.

---

### 1. Sécurisation et couverture des routes critiques (tests)
- [ ] Étendre la couverture Jest/Supertest sur :
  - [ ] `/api/adaptive-learning/suggest-accounts` (POST)
    - Cas : 401 sans JWT, 403 mauvais tenant, payload invalide, succès (mock service)
  - [ ] `/api/adaptive-learning/feedback` (POST)
    - Cas : 401, 403, payloads edge-case (déjà commencé, à compléter)
  - [ ] `/api/accounts` (CRUD complet)
    - GET, POST, PUT, DELETE : droits, isolation, erreurs, payloads invalides
  - [ ] `/api/ocr` (upload, extraction)
    - Isolation tenant, erreurs de fichier, payloads
  - [ ] `/api/notifications`, `/api/document-*` (si multi-tenant)

### 2. Tests d’intégration end-to-end
- [ ] Mettre en place des tests qui utilisent une vraie base de test (pas de mocks)
  - [ ] Flux complet : inscription, login, création tenant, actions, vérif isolation
  - [ ] Seed multi-tenant pour scénarios réalistes

### 3. Fonctionnalités métier avancées
- [ ] Feedback adaptatif : affiner la logique de prise en compte du feedback utilisateur
  - [ ] Machine learning/statistiques sur les patterns
  - [ ] API pour récupérer l’historique de feedback
- [ ] Gestion des rôles/permissions
  - [ ] Ajouter middleware de contrôle de rôle (admin/user)
  - [ ] Tests d’accès restreint sur certaines routes
- [ ] Notifications temps réel
  - [ ] Tester WebSocket multi-tenant
  - [ ] Simuler des push notifications et vérifier l’isolation

### 4. Robustesse, industrialisation et CI
- [ ] Activer la couverture de code (`jest --coverage`)
- [ ] Badge de couverture dans le README
- [ ] Pipeline CI stricte : tests, lint, migrations à chaque PR
- [ ] Scripts de seed/démo pour onboarding rapide
- [ ] Documentation claire pour chaque module/service (Swagger/OpenAPI, guides d’intégration)

### 5. Documentation & onboarding
- [ ] Documenter chaque endpoint protégé et la stratégie d’isolation
- [ ] Rédiger un guide onboarding pour nouveaux devs
- [ ] Ajouter un mode d’emploi pour la contribution (tests, conventions, CI)

En suivant ce workflow, tu limites les surprises (ex. changement de `tenantId`) tout en conservant une cadence rapide de développement.
