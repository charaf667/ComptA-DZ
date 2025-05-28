# Changelog ComptaDZ

Ce fichier contient l'historique des modifications importantes apportées au projet ComptaDZ lors de nos sessions de développement.

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

### Implémentation du module OCR et classification IA

- **Génération automatique des fichiers de service**
  - api/src/services/ocr.service.ts : Service OCR pour extraction et prétraitement
  - api/src/services/ai-classification.service.ts : Service IA pour suggestion de comptes
  - api/src/controllers/ocr.controller.ts : Contrôleur pour gérer les requêtes OCR
  - api/src/routes/ocr.routes.ts : Routes pour les endpoints OCR
  - api/src/routes/index.ts : Configuration des routes principales incluant OCR
  - api/src/types/pdf-parse.d.ts : Déclaration de type pour pdf-parse

- **Corrections techniques**
  - Correction de l'utilisation de sharp (import correct)
  - Correction de l'initialisation du worker Tesseract
  - Ajout des déclarations de types manquantes
  - Correction de l'import de pdf-parse pour compatibilité TypeScript (esModuleInterop)

- **Développement du frontend pour l'OCR et la classification**
  - Composants d'interface utilisateur
    - ui/src/components/ocr/FileUpload.tsx : Composant pour téléverser des factures
    - ui/src/components/ocr/ExtractedDataDisplay.tsx : Affichage des données extraites
    - ui/src/components/ocr/AccountSuggestions.tsx : Présentation des suggestions de comptes
  - Service d'intégration API
    - ui/src/services/ocr.service.ts : Communication avec le backend OCR
  - Page complète d'OCR
    - ui/src/pages/ocr/OcrPage.tsx : Interface complète d'upload, visualisation et validation

- **Optimisations UI et corrections**
  - Harmonisation de l'interface utilisateur avec la palette de couleurs existante
  - Utilisation des variables de couleur personnalisées dans tous les composants OCR
  - Installation des dépendances manquantes (react-icons, @types/node)
  - Correction des imports de types pour la compatibilité TypeScript strict
  - Suppression des variables inutilisées
  - Résolution des problèmes de configuration (TailwindCSS, PostCSS)
  - Mise à jour des versions des packages pour assurer la compatibilité
  - Conversion des modules CommonJS vers ES Modules


- **Création des services backend**
  - Service OCR pour l'extraction des données de factures
  - Service de classification IA pour la suggestion de comptes
  - Contrôleur et routes API pour l'OCR et la classification

- **Fonctionnalités implémentées**
  - Extraction des données via OCR (date, montant, TVA, libellé, fournisseur)
  - Prétraitement d'images pour améliorer la qualité de l'OCR
  - Classification automatique basée sur des règles
  - Génération automatique d'écritures comptables
  - API REST pour l'upload de factures et la classification

- **Dépendances ajoutées**
  - tesseract.js pour l'OCR
  - pdf-parse pour l'extraction de texte des PDF
  - multer pour la gestion des uploads
  - sharp pour le prétraitement d'images

## 28 Mai 2025 (Mise à jour)

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
