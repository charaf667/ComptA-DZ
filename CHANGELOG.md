# Changelog ComptaDZ

## [Unreleased]

### Sécurité & Auth Middleware (2025-06-25)
- Ajout de tests Jest + Supertest pour le middleware d’authentification et la route `/api/performance-metrics`.
- Mock complet de `AdaptiveLearningService` pour isoler la logique d’auth.
- Suppression des logs asynchrones dans les tests via `jest.spyOn(console, ...)`.
- Ajout des dépendances `supertest` et `@types/supertest` dans `devDependencies`. 


### RBAC & Isolation multi-tenant (2025-06-25)
- Application du middleware `tenantIsolation()` sur toutes les routes sensibles (accounts, accounting-entries, users, notifications, OCR, adaptive-learning).
- Chaîne de sécurité standardisée : `authMiddleware → tenantIsolation() → requireRoles()`.
- Mise à jour des routes et imports TypeScript.
- Tous les tests Jest/Supertest passent après refactorisation.

### Tests & Documentation (2025-06-24)
- Tous les tests unitaires existants passent (AccountRepository, AdaptiveLearningService).
- Correction des mocks et alignement des interfaces (`compteCode`, `scoreConfiance`).
- Ajout des types globaux `src/types/ocr.ts` et `src/types/adaptive-learning.ts`.
- Mise à jour de `tsconfig.json` pour exclure les tests du `rootDir`.
- Mise à jour de `DEV_WORKFLOW.md` avec un journal de progression et la check-list des étapes à court terme.


### Infrastructure de tests et workflow de développement (2025-06-24)
- Mise en place de Jest pour les tests unitaires et d'intégration
  - Configuration complète avec `jest.config.ts` et `tests/setup.ts`
  - Création de tests pour `AccountRepository` et `AdaptiveLearningService`
  - Isolation des tests avec tenant dédié pour éviter les conflits
- Ajout d'ESLint et Prettier pour la qualité du code
  - Configuration adaptée au projet TypeScript/Express
  - Scripts npm `lint`, `lint:fix` et `format`
- Script `db:reset` pour réinitialiser proprement la base de données
  - Combinaison de `prisma migrate reset` et du script de seed
  - Idempotence garantie pour les environnements de développement
- Configuration CI/CD avec GitHub Actions
  - Pipeline automatisée avec PostgreSQL en container
  - Tests, lint et migrations exécutés à chaque PR
- Documentation du workflow de développement dans `DEV_WORKFLOW.md`
  - Guide complet pour le développement en solo
  - Bonnes pratiques pour éviter les régressions

### Multi-tenancy & Seed de développement (2025-06-24)
- Ajout du script `seed-demo-tenants.ts` pour générer automatiquement plusieurs tenants de démonstration avec UUID fixes et administrateurs dédiés.
- Chaque tenant reçoit un plan comptable par défaut via `init-db-with-accounts.ts`.
- Les identifiants de connexion admin sont :
  - Demo : admin+demo@comptadz.com / Admin@123
  - Acme : admin+acme@comptadz.com / Admin@123
  - MyCabinet : admin+mycabinet@comptadz.com / Admin@123
- Permet de tester l'isolation des données et la logique multi-tenant en dev avant migration prod.
- Le seed est idempotent : aucun doublon si relancé.

#### Plan de test multi-tenant
1. Exécuter le script : `npx ts-node seed-demo-tenants.ts`
2. Vérifier dans la base la présence des tenants et comptes associés.
3. Se connecter au frontend avec chaque admin pour valider l'isolation des données.
4. Tester les endpoints OCR, feedback, learning-patterns pour chaque tenant.
5. Vérifier les erreurs 403/400 en cas d'absence de JWT ou de mauvais tenantId.
6. Valider que toutes les requêtes Prisma utilisent bien tenantId.


### Ajouts & Corrections
- **Correction de la gestion du tenantId dans l'API d'apprentissage adaptatif (2025-06-24) :** 
  - Refactorisation du service `AdaptiveLearningService` pour être stateless vis-à-vis du `tenantId`
  - Modification de toutes les méthodes pour accepter `tenantId` comme paramètre explicite
  - Correction de la propagation du `tenantId` dans `ai-classification.service.ts` et `ocr.controller.ts`
  - Ajout de méthodes manquantes (`initializePerformanceMetrics`, `findPatternByText`)
  - Correction des erreurs de compilation et de lint
  - Amélioration de la robustesse pour la sauvegarde et récupération des patterns et métriques de performance
  - Correction du contrôleur `adaptive-learning.controller.ts` pour utiliser `AuthRequest` et extraire correctement le `tenantId`
  - Modification de la méthode `classifyDocument` dans `ai-classification.service.ts` pour accepter le `tenantId` et gérer correctement les appels asynchrones
  - Correction des routes OCR pour passer le `tenantId` comme premier paramètre à `getPatterns`
  - Correction des appels à `aiClassificationService.classifyDocument` dans `ocr.controller.ts` pour utiliser `await` et passer le `tenantId`
  - Uniformisation de l'extraction du `tenantId` avec `req.tenant?.id` dans toutes les méthodes du contrôleur OCR
  - Ajout du middleware `authMiddleware` à toutes les routes OCR nécessitant l'authentification
- **Correction du routage de l'API (2025-06-21) :** Résolution des erreurs 404 sur les endpoints `/api/adaptive-learning/*` et `/api/accounts` en centralisant la déclaration des routes dans `api/src/index.ts`.
- **Correction du démarrage du backend (2025-06-21) :** Résolution des erreurs de connexion à la base de données (PostgreSQL sur Docker) et exécution du script d'initialisation (`init-db-with-accounts.ts`).
- Création des endpoints e2e pour l'apprentissage adaptatif :
  - POST /api/adaptive-learning/suggest-accounts (suggestions de comptes après extraction OCR)
  - POST /api/adaptive-learning/feedback (enregistrement du feedback utilisateur sur la suggestion)
- Intégration du contrôleur et du routeur Express associés
- Début de la validation bout-en-bout du module IA adaptatif (flux OCR → suggestion → feedback → adaptation → métriques)

- Mise à jour du service UI pour l'apprentissage adaptatif (`ui/src/services/ocr.service.ts`):
  - Ajout de la méthode `getAdaptiveSuggestions` pour appeler `POST /api/adaptive-learning/suggest-accounts`.
  - Modification de la méthode `sendFeedback` pour appeler `POST /api/adaptive-learning/feedback` avec la structure de données attendue (incluant `originalExtractedData`).
- Mise à jour de l'interface `FeedbackData` dans `ui/src/types/ocr.ts` pour inclure `originalExtractedData`, nécessaire pour le feedback adaptatif.
- Intégration de l'apprentissage adaptatif dans la page OCR (`ui/src/pages/ocr/OcrPage.tsx`):
  - Appel à `ocrService.getAdaptiveSuggestions` après le traitement initial du fichier pour récupérer et afficher les suggestions adaptatives.
  - Mise à jour de la logique d'envoi du feedback (`validateAndSave`) pour inclure `originalExtractedData` lors de l'appel à `ocrService.sendFeedback`.

- Correction des erreurs TypeScript liées à l'utilisation des composants Grid de Material UI dans `ExplanationMetricsPanel.tsx` (utilisation correcte de `component="div"` et des props de largeur).
- Résolution des problèmes d'importation des types d'explication (`ExplanationFactor`, `ExplanationDetail`, `ExplanationMetrics`) en créant des fichiers de types locaux pour le backend (`api/src/services/types/explanation.ts`) et le frontend (`ui/src/components/ai/types/explanation.ts`).
- Mise à jour des chemins d'importation dans les fichiers concernés pour assurer la cohérence.
- Documentation de la logique IA actuelle entièrement en TypeScript côté backend.

## [1.3.5] - 2025-06-19
### Fixed
- Correction des erreurs TypeScript dans le service AdaptiveLearningService :
  - Résolution des problèmes liés aux propriétés inexistantes dans l'interface AccountSuggestion (utilisation de `compteCode` au lieu de `compteId` inexistant)
  - Séparation correcte des méthodes `recordFeedback` et `suggestAccounts` qui étaient incorrectement imbriquées
  - Amélioration de la gestion des patterns d'apprentissage et de leur sauvegarde

### Improved
- Finalisation de l'implémentation des métriques de performance pour l'apprentissage adaptatif
- Amélioration de la robustesse du service d'apprentissage adaptatif avec une meilleure gestion des types

### Évolution & Architecture

### Prochaines tâches à planifier
- Tester tout ce qui a été implémenté concernant les notifications et l'IA (tests unitaires, tests d'intégration, validation fonctionnelle sur l'UI et le backend).

- Nettoyer les fichiers sources pour supprimer le code obsolète ou non utilisé.
- Organiser tous les styles dans des fichiers dédiés Tailwind CSS pour une meilleure maintenabilité et clarté du front-end.
- Supprimer toutes les données statiques présentes dans le code (mock, hardcoded) et s'assurer que toutes les données affichées/proposées proviennent de la base de données réelle.

- Clarification de l'architecture actuelle : IA métier codée en TypeScript/NestJS, sans microservice Python.
- Préparation à une future évolution vers une architecture hybride Node.js (NestJS) + Python (microservice IA avancée).
- Ajout d'une note sur la scalabilité : la structure hybride sera la plus scalable pour l'intégration de modèles ML avancés ou de traitements lourds.


### Pivot stratégique vers un SaaS nouvelle génération (2025-06-18)

#### Ajouté
- Document PIVOTATION.md détaillant la vision, les axes d’innovation et les priorités pour dépasser Cirta IT.
- Plan d’intégration d’une IA explicable et adaptative (suggestions auto-apprenantes, feedback utilisateur, explication des choix IA).
- Assistant IA intégré (chatbot d’aide comptable, détection d’erreurs, recommandations proactives).
- Reconnaissance documentaire avancée (extraction OCR multilingue, gestion des tableaux, tampons, signatures).
- Édition collaborative temps réel (modification simultanée, gestion fine des droits, historique des modifications).
- Workflows automatisés (circuits de validation, notifications intelligentes, rappels).
- API publique et documentation interactive, connecteurs automatiques (banques, e-commerce, BI, impôts, etc.).
- Marketplace de modules/plugins (extensions tierces : CRM, RH, fiscalité…).
- Auditabilité totale (journal d’audit exportable, accès expert-comptable, outils d’audit).
- Conformité dynamique IFRS/PCN (règles évolutives, simulateur d’impact réglementaire, alertes).
- Sécurité renforcée (2FA, chiffrement, hébergement multi-régions, conformité RGPD/algérienne).
- Interface moderne & responsive (thèmes personnalisables, dashboard dynamique, PWA/mobile).
- Onboarding interactif (tutoriels, aide contextuelle, assistant de prise en main).
- BI intégrée (tableaux de bord personnalisables, analyses prédictives, export PowerBI/Tableau).
- Benchmarks sectoriels (comparaison anonyme avec le secteur, alertes sur écarts de performance).

#### Modifié/Amélioré
- Positionnement produit : ComptaDZ vise à devenir la référence SaaS intelligente, collaborative, ouverte et sécurisée du marché algérien et africain.
- Roadmap alignée sur ces nouveaux axes stratégiques.

### Added
- Système d'enregistrement des feedbacks utilisateurs dans le module OCR

### Fixed
- Erreurs TypeScript dans le contrôleur OCR
- Validation des données manquantes dans les requêtes feedback
- Correction des erreurs TypeScript dans NotificationContext.tsx :
  - Implémentation des fonctions manquantes (markAllAsRead, loadMore)
  - Correction des types de retour des fonctions asynchrones
  - Amélioration de la gestion d'erreur et des états de chargement
  - Mise à jour cohérente des états locaux (notifications, unreadCount)
  - Correction des imports/exports incohérents (NotificationResponse vs NotificationListResponse)

## [1.3.3] - 2025-06-04
### Changed
- Correction du typage global Express Request (req.user) :
    - Déclaration unique dans src/types/global.d.ts (namespace express-serve-static-core)
    - Suppression de toutes les augmentations locales dans les contrôleurs (notamment ocr.controller.ts)
    - Plus aucune erreur TypeScript sur req.user dans tout le backend
- Préparation à la migration vers un système de notifications en temps réel (WebSockets) pour les feedbacks OCR et autres événements critiques.

## [1.3.2] - 2025-06-04
### Fixed
- Correction des erreurs d'authentification (401) dans les requêtes API du module OCR
- Résolution des problèmes de format de données causant les erreurs 400 dans les feedbacks
- Amélioration de la propagation du tenantId dans les composants OCR

### Added
- Système d'intercepteurs Axios pour l'authentification automatique
- Rechargement automatique des métriques dans le tableau de bord administrateur
- Indicateurs visuels pour les états de rafraîchissement des données

### Improved
- Amélioration de la navigation : Ajout d'un lien direct vers la page d'administration des "Learning Patterns" dans l'en-tête principal pour un accès facilité.

## [1.3.1] - 2025-06-04
### Corrigé
- Correction de la gestion du `tenantId` pour le plan comptable dans le module OCR
  - Utilisation correcte du hook `useAuth()` dans `OcrPage.tsx` pour récupérer les informations du tenant
  - Passage du `tenantId` correct au composant `AccountSuggestions`
  - Résolution des erreurs de syntaxe JSX dans le formulaire de feedback
  - Documentation du processus de récupération du `tenantId` via le contexte d'authentification

### Amélioré
- Meilleure intégration du système multi-tenant dans le module OCR
- Utilisation plus cohérente des informations d'authentification dans les composants React

## [1.3.0] - 2025-06-03
### Ajout
- Backend d'apprentissage adaptatif amélioré
  - Nouvelle méthode `getPatterns` dans le service d'apprentissage adaptatif
  - API REST `/ocr/learning-patterns` pour récupérer et filtrer les patterns d'apprentissage
  - Filtrage par code de compte, confiance minimum et nombre d'occurrences
- Interface d'administration des patterns d'apprentissage
  - Page dédiée à la visualisation des patterns appris
  - Filtres interactifs et recherche avancée
  - Export CSV des patterns pour analyse externe
  - Visualisation graphique des niveaux de confiance

### Amélioration
- Optimisation de la boucle de feedback utilisateur pour l'apprentissage adaptatif
- Envoi asynchrone du feedback utilisateur lors de la validation des suggestions

## [1.2.0] - À venir
### Ajout
- Tests automatisés sur l'import CSV et la suggestion de comptes
- Mode debug pour la suggestion de comptes OCR
- Amélioration de la gestion des erreurs CSV (frontend et backend)
- Option de création manuelle de compte lors de l'OCR si aucune suggestion

### Amélioration
- Documentation utilisateur enrichie (import, OCR, suggestions)


## [1.1.0] - 2025-05-30
### Ajout : Import du plan comptable depuis un fichier CSV
- Backend :
  - Nouvelle route API POST `/accounts/import-csv` (Express, multer, csv-parse)
  - Validation du format CSV, gestion multi-tenant, suppression du fichier temporaire
  - Gestion des erreurs UX-friendly (doublons, structure, etc)
- Frontend :
  - Bouton "Import CSV" sur la page du plan comptable
  - Dialogue d'upload, feedback utilisateur, rafraîchissement automatique
  - Gestion du loading, erreurs, et notifications

#### Utilisation confirmée
- Premier import CSV effectué avec succès après suppression de tous les comptes existants.
- La vérification côté backend empêche tout écrasement accidentel.
- Le feedback utilisateur est clair en cas de tentative sur une base non vide.

#### Amélioration UX (MVP)
- Ajout d'un bouton pour télécharger un template CSV conforme depuis le dialogue d'import.
- Explication claire du format attendu et aide intégrée dans le dialogue d'import.
- Les autres suggestions d'amélioration UX sont planifiées pour après la sortie MVP.


Ce fichier contient l'historique des modifications importantes apportées au projet ComptaDZ lors de nos sessions de développement.

## [Version 0.10.1] - 2025-05-30
### Corrigé
- Suppression des warnings React liés aux clés `key` manquantes dans les listes de comptes (TableRow et MenuItem).
- Correction de la casse des valeurs de Select (catégorie/type) pour compatibilité stricte avec MUI.
- Harmonisation des identifiants utilisés dans les composants React avec la structure Prisma (`id` au lieu de `_id`).
- Renforcement de la robustesse du formulaire de gestion des comptes.

## [Version 0.10.0] - 2025-05-30

### Changed
- Migration complète du module de gestion des comptes du backend de Mongoose vers Prisma
- Vérification complète de l'endpoint d'import du plan comptable (importDefaultChartOfAccounts) : fonctionne sur base vide, gestion des erreurs et doublons validée
- Audit complet du CRUD comptes (create, read, update, delete) : conformité aux règles métier, gestion parent/enfant, validation stricte, gestion des erreurs
- Amélioration du CRUD comptes : gestion du changement de parent avec prévention des cycles, validation stricte des enums, harmonisation des messages d'erreur, correction TypeScript
- Résolution du problème de création de comptes dans le système multi-tenant :
  - Vérification explicite de l'existence du tenant avant création d'un compte
  - Harmonisation des conventions de casse entre frontend et backend (minuscules)
  - Gestion spécifique des erreurs Prisma P2025 (relation non trouvée)
  - Validation robuste des champs avec messages d'erreur explicites et informations de débogage
- Création d'outils de maintenance et initialisation :
  - Script d'initialisation de base de données (tenant et admin)
  - Script d'initialisation complète avec plan comptable par défaut
  - Outil CLI pour exécution facile des scripts d'initialisation
- Nouveau modèle `Account` dans Prisma avec gestion des relations parent-enfant
- Refactoring du contrôleur comptes pour utiliser Prisma (CRUD, import, validation, gestion erreurs)
- Ajout de la variable d'environnement `USE_MONGOOSE` pour désactiver MongoDB
- Amélioration de la validation des données et de la gestion d'erreurs
- Mise à jour de la documentation technique et du .env
- Préparation de l'intégration OCR et classification IA (backend, frontend)

### Finalisation CRUD comptes (backend & frontend)
- Correction complète du CRUD comptes côté frontend :
  - Ajout du champ `id` dans l'interface `IAccount` pour compatibilité totale avec Prisma
  - Harmonisation de l'utilisation des identifiants dans les composants React (AccountFormDialog, ChartOfAccountsPage)
  - Correction des appels update/delete pour utiliser `account.id` (et non `_id`)
  - Résolution du bug "id undefined" lors des opérations de modification et suppression
  - Vérification de la compatibilité multi-tenant et parent/enfant sur toute la chaîne
- Correction et documentation technique détaillée sur la gestion des erreurs, la validation stricte des enums et la prévention des cycles parent/enfant
- Mise à jour des scripts d'initialisation pour garantir la cohérence des données en environnement de dev
- Documentation technique enrichie (PROGRESS.md, IFRS.md) sur la migration, l'architecture multi-tenant, et les bonnes pratiques CRUD

## [Version 0.9.2] - 2025-05-29

### Added
- Tests et validation du système de notifications
  - Outils de test intégrés pour générer des notifications de différents types
  - Interface utilisateur de test avec bouton visible uniquement en mode développement
  - Logs améliorés pour faciliter le débogage des notifications

### Changed
- Sécurisation de l'endpoint de test des notifications
  - Vérification d'environnement améliorée pour bloquer l'accès en production
  - Meilleure gestion des erreurs et affichage des détails dans la console

### Fixed
- Correction du problème d'accès à l'endpoint `/notifications/test`
- Résolution des erreurs de typage TypeScript dans la gestion des erreurs axios

## [Version 0.9.1] - 2025-05-29

### Fixed
- Correction des erreurs TypeScript dans le système de notifications
  - Résolution des problèmes de signatures de méthodes dans le service de notification
  - Correction des erreurs d'appels de méthodes inexistantes
  - Résolution des incompatibilités de types dans le contrôleur de notification
  - Correction de la redirection après connexion dans ProtectedRoute
- Amélioration de la robustesse du service d'événements
  - Implémentation temporaire pour les notifications d'expiration
  - Gestion correcte des notifications de mise à jour de document

## [Version 0.9.0] - 2025-05-29

### Added
- Système complet de notifications
  - Modèle de données pour différents types de notifications
  - Service d'événements pour l'émission automatique de notifications
  - Notifications pour commentaires, résolutions, assignations et échéances
  - API backend pour la gestion des notifications
  - Composant NotificationBell avec compteur et menu déroulant
  - Page complète de gestion des notifications avec filtres
  - Système de préférences de notification personnalisables

### Changed
- Intégration du système de notifications dans l'interface existante
- Optimisation de la structure du frontend pour améliorer la réactivité
- Correction des problèmes d'imports TypeScript pour compatibilité avec Vite

## [Version 0.8.0] - 2025-05-28

### Added
- Système de collaboration pour les documents comptables
  - Fonctionnalités de commentaires sur les documents
  - Système d'assignation de documents aux utilisateurs
  - Gestion des priorités et des statuts d'assignation
  - Marquage des commentaires comme résolus/non résolus
  - API backend complète pour la gestion de la collaboration

### Changed
- Intégration des fonctionnalités de collaboration avec le contexte d'authentification existant
- Optimisation des composants UI pour une expérience utilisateur fluide
- Amélioration de la structure du code pour faciliter la maintenance

## [Version 0.7.0] - 2025-05-28

### Added
- Système de versionnage Git-like pour les documents comptables
  - Historique complet des modifications pour chaque document
  - Comparaison visuelle entre différentes versions
  - Possibilité de restaurer des versions antérieures
  - API backend complète pour la gestion des versions

### Changed
- Amélioration de l'interface utilisateur pour faciliter la navigation dans l'historique des versions
- Optimisation du stockage des versions pour minimiser l'utilisation de l'espace

## [Version 0.6.0] - 2025-05-28

### Ajout

#### Améliorations de l'historique des documents (UX)
- Ajout d'animations de transition lors du chargement des documents avec framer-motion
- Implémentation d'un système de prévisualisation des documents (PDF/images)
- Ajout d'un système de tri des documents par différents critères (date, nom, fournisseur, montant, compte)
- Amélioration du système de tags avec des couleurs personnalisables basées sur le contenu
- Ajout d'un bouton de rafraîchissement des données

#### Intégration avec les écritures comptables
- Création d'un système de génération d'écritures comptables depuis les documents de l'historique
- Ajout d'un service backend pour la gestion des écritures comptables (`accounting-entries.service`)
- Implémentation d'un contrôleur REST pour les écritures comptables (`accounting-entries.controller`)
- Création de routes API pour les opérations CRUD sur les écritures comptables

#### Exportation et rapports financiers
- Implémentation d'un service d'exportation pour les documents (`export.service.ts`)
- Ajout de fonctionnalités d'exportation des documents au format PDF et Excel
- Intégration des documents dans les rapports financiers (mensuels, trimestriels, annuels)
- Création d'un composant d'exportation avec menu dépliant (`ExportDocumentsButton`)
- Génération de rapports financiers avec statistiques et analyses par fournisseur/compte

### Corrections
- Correction des erreurs TypeScript dans plusieurs composants
- Amélioration de la structure et de la modularité du code
- Optimisation des performances lors du chargement des documents lors de nos sessions de développement.

## 28 Mai 2025 - Amélioration OCR et Apprentissage Adaptatif

### Amélioration du système OCR et Classification IA

- **Implémentation de l'apprentissage adaptatif**
  - Création du service `adaptive-learning.service.ts` pour améliorer les suggestions basées sur le feedback utilisateur
  - Intégration avec le service de classification IA existant
  - Développement d'un système de stockage des patterns d'apprentissage

- **Amélioration de l'extraction de données**
  - Ajout de nouveaux champs extraits (date d'échéance, conditions de paiement, devise, etc.)
  - Amélioration des regex pour une meilleure précision d'extraction
  - Support avancé pour les informations détaillées des fournisseurs

- **Interface utilisateur améliorée**
  - Nouveau composant `FeedbackForm` pour collecter le feedback utilisateur
  - Amélioration du composant `AccountSuggestions` avec indicateurs visuels de source et de confiance
  - Intégration d'une barre de progression pour visualiser le score de confiance
  - Création du composant de base `ExtractedDataEditForm` pour l'édition des données OCR (`ui/src/pages/ocr/components/ExtractedDataEditForm.tsx`)
  - Intégration du formulaire `ExtractedDataEditForm` dans `OcrPage.tsx` avec gestion d'état pour l'affichage et la sauvegarde des modifications
  - Ajout de validation des champs du formulaire avec affichage des erreurs
  - Ajout d'un indicateur de chargement pendant la sauvegarde des données
  - Mise à jour automatique des suggestions de comptes après modification des données

- **API de feedback et d'édition**
  - Nouvel endpoint `/api/ocr/feedback` pour enregistrer le feedback utilisateur
  - Nouvel endpoint `/api/ocr/save-edited-data` pour sauvegarder les données modifiées
  - Méthode `saveEditedData` ajoutée au service OCR pour traiter les modifications manuelles
  - Intégration du feedback dans le processus d'apprentissage adaptatif
  - Système de correction des données extraites pour améliorer les futures extractions
  - Validation des données modifiées côté serveur

## 28 Mai 2025 - Plan Comptable IFRS/PCN

### Ajout du Plan Comptable 10 Classes IFRS/PCN

- **Mise à jour README.md**
  - Ajout de la structure des 10 classes comptables IFRS/PCN
  - Ajout d'exemples de classification automatique par IA
  - Intégration de la validation de conformité IFRS
  - Documentation des endpoints API pour le plan comptable et l'IA
  - Ajout des variables d'environnement pour OCR et IA

- **Création IFRS.md**
  - Documentation technique du plan comptable 10 classes
  - Structure de la base de données PostgreSQL pour IFRS
  - Moteur de suggestion basé sur des règles et IA
  - Exemples d'usage pratiques
  - Plan d'implémentation progressive

- **Mise à jour PROGRESS.md**
  - Restructuration des sprints pour inclure:
    - Classification IA (Sprint 2)
    - Plan comptable 10 classes IFRS/PCN (Sprint 3)
    - Validation conformité IFRS (Sprint 3)
    - États financiers par classe (Sprint 4)
  - Ajout de métriques d'avancement pour le plan comptable et l'IA
  - Documentation IFRS ajoutée aux quick wins réalisés

- **Mise à jour Plandev.md**
  - Alignement des sprints avec le plan comptable 10 classes
  - Intégration des tâches de classification IA
  - Planification de la validation automatique IFRS

### Implémentation Frontend (Session précédente)

- **Structure Frontend**
  - Création d'une architecture modulaire
  - Mise en place des composants de base
  - Intégration de TailwindCSS pour le styling

- **Authentification**
  - Implémentation du système d'authentification complet
  - Création du contexte d'authentification
  - Protection des routes

- **Pages Principales**
  - Création du dashboard avec statistiques
  - Page de gestion des factures
  - Profil utilisateur
  - Landing page

- **Navigation**
  - Mise en place du layout principal avec sidebar
  - Système de navigation entre les pages

## 28 Mai 2025 (Suite)

### Résolution du problème de page blanche et robustesse du frontend

- **Correction des imports lazy et navigation**
  - Passage des imports indirects via les index.ts à des imports directs des composants (ex: './pages/auth/Login')
  - Suppression des références incorrectes aux propriétés de module (ex: module.Login)
  - Ajout de gestionnaires d'erreurs explicites pour tous les imports dynamiques (lazy loading)
  - Affichage d'un message d'erreur à l'écran et dans la console en cas d'échec du chargement d'un composant

- **Correction des variables d'environnement avec Vite**
  - Remplacement de process.env.REACT_APP_API_URL par import.meta.env.VITE_API_URL dans les services pour compatibilité Vite

- **Correction de la configuration et sécurité**
  - Correction des incompatibilités entre React, React Router et les modules de configuration (PostCSS, TailwindCSS)
  - Mise à jour des dépendances pour stabilité
  - Correction d'une vulnérabilité modérée dans PostCSS (CVE GHSA-7fh5-64p2-3v2j) via npm audit fix

Ces actions ont permis de restaurer l'affichage, d'améliorer le débogage et d'assurer la robustesse du frontend.

---

## 28 Mai 2025 (Suivi)

### Bug persistant : page blanche après connexion

- Après correction des imports lazy et de la configuration Vite, un bug de page blanche subsiste lors de la connexion.
- Diagnostic en cours :
  - Vérification du DashboardLayout et du composant Dashboard
  - Analyse de la logique du contexte d'authentification
  - Inspection de la console navigateur pour erreurs JavaScript
- Prochaines étapes :
  - Correction du composant fautif dès identification
  - Ajout de logs et fallback UI pour éviter les blocages visuels

### Test de la fonctionnalité OCR et API backend

- Tests effectués avec un exemple de facture PDF (Facture Exemple 2) via l'interface OCR
- Erreur détectée : `POST http://localhost:5000/api/ocr/process net::ERR_CONNECTION_REFUSED`
- Problèmes identifiés :
  1. **Divergence de ports** : Le frontend essaie de se connecter au port 5000, mais l'API est configurée sur le port 4000
  2. **Port déjà utilisé** : Erreur `EADDRINUSE: address already in use :::4000` lors du démarrage de l'API

### Résolution des problèmes de connexion API

- **Correction de la configuration du port** :
  - Modification de l'URL de l'API dans le frontend pour utiliser le port 4000 au lieu de 5000
  - Mise à jour du fichier `ocr.service.ts` avec la nouvelle URL
- **Démarrage réussi de l'API** :
  - Vérification que le port 4000 est disponible
  - Démarrage du serveur API avec succès : `Serveur ComptaDZ démarré sur le port 4000`
  - API accessible via `http://localhost:4000`
- **Documentation mise à jour** pour éviter les futurs problèmes de configuration

### Diagnostic et résolution des problèmes OCR

- **Problèmes identifiés dans l'API OCR** :
  1. **Dossiers manquants** : Les dossiers `uploads` et `temp` nécessaires pour le traitement des fichiers OCR ne sont pas créés automatiquement
  2. **Gestion des erreurs incomplète** : Certaines erreurs dans le processus OCR ne sont pas correctement gérées
  3. **Problèmes de dépendances** : Possibles incompatibilités entre les versions de tesseract.js, pdf-parse et sharp
  4. **Problème de CORS** : Configuration CORS potentiellement manquante pour permettre les requêtes depuis le frontend

- **Solutions implémentées** :
  1. Création explicite des dossiers `uploads` et `temp` au démarrage de l'API
  2. Amélioration de la gestion des erreurs dans les services OCR et IA
  3. Configuration CORS complète pour permettre les requêtes depuis le frontend
  4. Mise en place de logs détaillés pour faciliter le débogage

### Correction des erreurs TypeScript dans les services API

- **Problèmes identifiés** :
  1. **Erreurs d'importation de types** : Les types `AxiosInstance`, `AxiosRequestConfig` et `AxiosResponse` étaient importés sans la syntaxe `import type`
  2. **Type obsolète** : Utilisation de `AxiosRequestConfig` au lieu de `InternalAxiosRequestConfig` dans les intercepteurs
  3. **Incohérence des ports API** : Différents services utilisaient des ports différents (3001, 5000, 4000)

- **Solutions implémentées** :
  1. Correction des imports de types avec la syntaxe `import type { ... } from 'axios'`
  2. Mise à jour des intercepteurs pour utiliser `InternalAxiosRequestConfig`
  3. Uniformisation de tous les services pour utiliser le port 4000
  4. Documentation des modifications pour maintenir la cohérence

### Correction des routes OCR manquantes dans l'API

- **Problème identifié** : Erreur 404 (Not Found) lors de l'accès à `http://localhost:4000/api/ocr/process`
- **Cause identifiée** : Les routes OCR étaient définies dans le fichier `ocr.routes.ts` mais n'étaient pas importées ni configurées dans le fichier principal `index.ts` de l'API
- **Solution implémentée** :
  1. Ajout de l'import `import ocrRoutes from './routes/ocr.routes';` dans `index.ts`
  2. Configuration de la route avec `app.use('/api/ocr', ocrRoutes);`
  3. Redémarrage du serveur API pour appliquer les modifications

### Résolution des problèmes de compilation et de port

- **Problèmes identifiés** :
  1. **Erreur de types TypeScript** : `Could not find a declaration file for module 'pdf-parse'`
  2. **Port déjà utilisé** : `Error: listen EADDRINUSE: address already in use :::4000`

- **Solutions implémentées** :
  1. **Pour l'erreur de types** :
     - Remplacement de `import pdf from 'pdf-parse';` par `const pdf = require('pdf-parse');` dans `ocr.service.ts`
     - Création d'un fichier de déclaration global `global.d.ts` pour les modules sans types
  2. **Pour le port déjà utilisé** :
     - Arrêt du processus existant utilisant le port 4000
     - Redémarrage du serveur API avec les nouvelles configurations

### Amélioration de la gestion des PDF corrompus

- **Problème identifié** : Erreur `bad XRef entry` lors du traitement de fichiers PDF potentiellement corrompus
- **Cause identifiée** : La bibliothèque pdf-parse échoue lors de la lecture de la table de références croisées (XRef) dans certains PDF mal formatés
- **Solutions implémentées** :
  1. **Validation préalable des PDF** :
     - Ajout d'une méthode `validatePdf` dans le service OCR pour vérifier la validité des PDF avant traitement
     - Vérification de la taille du fichier et de sa structure
  2. **Amélioration de la validation des fichiers** :
     - Vérification plus stricte des types MIME et des extensions de fichiers
     - Détection des fichiers avec des extensions incorrectes par rapport à leur contenu réel
  3. **Gestion d'erreurs spécifiques** :
     - Détection et gestion spécifique de l'erreur `bad XRef entry`
     - Messages d'erreur plus clairs et plus informatifs pour l'utilisateur
     - Nettoyage des fichiers temporaires en cas d'erreur

### Support spécifique pour les PDF générés par ChatGPT

- **Problème identifié** : Les PDF générés par ChatGPT ont une structure interne différente qui provoque des erreurs avec pdf-parse
- **Causes identifiées** :
  1. Structure XRef non standard dans les PDF générés par l'IA
  2. Erreur 400 (Bad Request) lors du traitement de ces fichiers spécifiques
- **Solutions implémentées** :
  1. **Mode de compatibilité pour les PDF générés par ChatGPT** :
     - Détection automatique des PDF générés par ChatGPT basée sur le nom du fichier
     - Ajout d'un flag `isChatGptPdf` transmis du frontend au backend
     - Validation alternative pour ces PDF qui ignore les erreurs de structure XRef
  2. **Logs de diagnostic améliorés** :
     - Affichage détaillé des informations sur le fichier (nom, type, taille, date de modification)
     - Logs spécifiques pour le traitement des PDF générés par ChatGPT
  3. **Approche de validation simplifiée** :
     - Vérification de la présence de l'en-tête PDF (`%PDF-`) au lieu d'une validation complète de la structure

## 28 Mai 2025 (Suite)

### Amélioration de la classification IA et extraction de données avancée

- **Amélioration de la classification IA** :
  1. **Enrichissement des règles de classification** :
     - Ajout de plus de 50 règles de classification couvrant un large éventail de catégories de dépenses et revenus
     - Classification multi-sources basée sur le libellé, le fournisseur et la référence
     - Calcul plus précis des scores de confiance selon la source et la priorité
  2. **Implémentation de l'apprentissage adaptatif** :
     - Création d'un service d'apprentissage adaptatif pour améliorer les suggestions au fil du temps
     - Enregistrement du feedback utilisateur pour affiner les suggestions futures
     - Détection de patterns récurrents dans les choix de l'utilisateur
     - Ajout d'une API dédiée pour enregistrer les feedbacks (`/api/ocr/feedback`)
  3. **Amélioration des scores de confiance** :
     - Pondération des sources de données selon leur fiabilité
     - Augmentation progressive de la confiance avec l'usage répété
     - Dédoublonnage intelligent des suggestions

- **Extraction de données avancée** :
  1. **Enrichissement des données extraites** :
     - Ajout de nouveaux champs : date d'échéance, conditions de paiement, devise, numéro de facture
     - Extraction des informations complètes du fournisseur : adresse, email, téléphone, NIF
     - Détection des articles facturés avec quantité, prix unitaire et montant HT
  2. **Amélioration des expressions régulières** :
     - Expressions régulières plus précises pour chaque type de donnée
     - Meilleure détection des formats de date et de montant
     - Support de multiples formats de références et numéros de facture
  3. **Calcul de confiance avancé** :
     - Calcul pondéré de la confiance basé sur les champs de base et avancés
     - Normalisation des devises (DZD, EUR, USD)
     - Extraction intelligente des articles facturés à partir du texte

- **Résolution des avertissements React Router** :
  1. **Configuration des futures flags** :
     - Création d'un fichier de configuration pour les futures flags de React Router v7
     - Activation des flags `v7_startTransition` et `v7_relativeSplatPath`
     - Chargement précoce de la configuration avant tout autre import de React Router
  2. **Nettoyage du code** :
     - Suppression des imports inutilisés
     - Optimisation des imports pour réduire la taille du bundle
     - Documentation des modifications pour faciliter la maintenance future
     - Contournement des erreurs XRef pour les PDF qui contiennent du contenu valide

## 28 Mai 2025 (Suite)

### Amélioration de la classification IA et extraction de données avancée

- **Amélioration de la classification IA** :
  1. **Enrichissement des règles de classification** :
     - Ajout de plus de 50 règles de classification couvrant un large éventail de catégories de dépenses et revenus
     - Classification multi-sources basée sur le libellé, le fournisseur et la référence
     - Calcul plus précis des scores de confiance selon la source et la priorité
  2. **Implémentation de l'apprentissage adaptatif** :
     - Création d'un service d'apprentissage adaptatif pour améliorer les suggestions au fil du temps
     - Enregistrement du feedback utilisateur pour affiner les suggestions futures
     - Détection de patterns récurrents dans les choix de l'utilisateur
     - Ajout d'une API dédiée pour enregistrer les feedbacks (`/api/ocr/feedback`)
  3. **Amélioration des scores de confiance** :
     - Pondération des sources de données selon leur fiabilité
     - Augmentation progressive de la confiance avec l'usage répété
     - Dédoublonnage intelligent des suggestions

- **Extraction de données avancée** :
  1. **Enrichissement des données extraites** :
     - Ajout de nouveaux champs : date d'échéance, conditions de paiement, devise, numéro de facture
     - Extraction des informations complètes du fournisseur : adresse, email, téléphone, NIF
     - Détection des articles facturés avec quantité, prix unitaire et montant HT
  2. **Amélioration des expressions régulières** :
     - Expressions régulières plus précises pour chaque type de donnée
     - Meilleure détection des formats de date et de montant
     - Support de multiples formats de références et numéros de facture
  3. **Calcul de confiance avancé** :
     - Calcul pondéré de la confiance basé sur les champs de base et avancés
     - Normalisation des devises (DZD, EUR, USD)
     - Extraction intelligente des articles facturés à partir du texte

- **Résolution des avertissements React Router** :
  1. **Configuration des futures flags** :
     - Création d'un fichier de configuration pour les futures flags de React Router v7
     - Activation des flags `v7_startTransition` et `v7_relativeSplatPath`
     - Chargement précoce de la configuration avant tout autre import de React Router
  2. **Nettoyage du code** :
     - Suppression des imports inutilisés
     - Optimisation des imports pour réduire la taille du bundle
     - Documentation des modifications pour faciliter la maintenance future
     - Contournement des erreurs XRef pour les PDF qui contiennent du contenu valide

## 28 Mai 2025 - Implémentation de l'Historique des Documents

### Développement du système d'historique des documents

- **Création des services backend**
  - Implémentation du service `document-history.service.ts` pour gérer l'historique des documents traités
  - Développement du contrôleur `document-history.controller.ts` pour exposer les API d'historique
  - Création des routes pour l'historique des documents dans `document-history.routes.ts`
  - Intégration des routes d'historique dans le routeur principal de l'API

- **Fonctionnalités d'historique implémentées**
  - Ajout de documents à l'historique après traitement OCR
  - Récupération des documents avec filtrage et pagination
  - Recherche de documents par texte, date, fournisseur, montant et compte
  - Suppression de documents de l'historique
  - Système de tags pour organiser les documents
  - Statistiques sur les documents traités (total, édités, par période)

- **Interface utilisateur pour l'historique**
  - Création de la page `DocumentHistoryPage.tsx` pour afficher l'historique des documents
  - Composant `DocumentSearchFilters` pour filtrer et rechercher des documents
  - Composant `DocumentList` pour afficher la liste des documents avec pagination
  - Composant `DocumentStatisticsPanel` pour visualiser les statistiques des documents
  - Intégration avec le service d'historique pour la gestion des données

### Corrections et améliorations du système d'historique des documents

- **Correction des erreurs TypeScript**
  - Résolution des problèmes de typage dans le service d'historique des documents
  - Ajout d'assertions de type pour garantir la compatibilité avec TypeScript
  - Correction des erreurs liées aux types `ProcessedDocument | undefined`

- **Amélioration de la navigation**
  - Ajout d'un lien vers la page d'historique des documents dans la barre latérale
  - Utilisation d'une icône d'horloge pour représenter l'historique des documents
  - Intégration harmonieuse avec les autres éléments de navigation

- **Intégration des routes API**
  - Configuration des routes d'historique des documents dans le fichier principal de l'API
  - Correction des problèmes d'accès aux endpoints d'historique
  - Tests de fonctionnement de l'API d'historique des documents

## Prochaines étapes planifiées

### Améliorations de l'interface utilisateur OCR

1. **Affichage des suggestions dans l'interface** :
   - Implémenter un composant d'affichage des suggestions de comptes avec leur score de confiance
   - Permettre à l'utilisateur de choisir parmi plusieurs suggestions
   - Ajouter une indication visuelle de la source de la suggestion (règles, apprentissage adaptatif)

2. **Interface d'édition des données extraites** :
   - Permettre la modification manuelle des données extraites avant validation
   - Ajouter un mode d'édition pour les champs avancés (articles facturés, informations fournisseur)
   - Implémenter une validation des données modifiées

3. **Historique des documents traités** :
   - Créer une page d'historique des documents traités par OCR
   - Permettre la recherche et le filtrage des documents par date, fournisseur, montant
   - Ajouter la possibilité de retraiter un document précédemment analysé

### Améliorations de l'apprentissage adaptatif

1. **Visualisation des patterns appris** :
   - Créer une interface d'administration pour visualiser les patterns appris
   - Permettre la modification ou suppression manuelle de patterns incorrects
   - Ajouter des statistiques sur l'efficacité de l'apprentissage

2. **Exportation et importation des données d'apprentissage** :
   - Implémenter des fonctionnalités d'exportation des patterns appris
   - Permettre l'importation de patterns prédéfinis ou partagés
   - Ajouter des sauvegardes automatiques des données d'apprentissage

3. **Apprentissage avancé basé sur l'IA** :
   - Intégrer des algorithmes d'apprentissage automatique plus avancés
   - Utiliser des techniques de traitement du langage naturel pour améliorer la compréhension des factures
   - Implémenter des modèles prédictifs pour anticiper les classifications futures

- Intégration du module OCR dans l'interface utilisateur
- Création des modèles et API pour le plan comptable 10 classes
- Intégration de la validation de conformité IFRS

## [0.1.0] - 2025-06-25
### Ajouté
- **Sprint 1 - CI/CD et Environnement** : 
  - Workflow CI backend stabilisé avec tests, couverture de code et upload d'artefacts.
  - Workflow CI UI configuré comme non bloquant temporairement pour prioriser le backend.
  - Fichier `.env.example` créé avec les variables essentielles.
  - Roadmap et planification des sprints dans `DEV_WORKFLOW.md`.

### En Cours
- Documentation onboarding pour setup, seeding et exécution du projet.
- Planification d'un sprint UI pour corriger les erreurs TypeScript frontend.
