/**
 * Modèle représentant une version de document
 * Implémente un système de versionnage inspiré de Git pour les documents comptables
 */

// Type pour les modifications spécifiques apportées au document
export interface DocumentChange {
  field: string;        // Champ modifié
  previousValue: any;   // Valeur précédente
  newValue: any;        // Nouvelle valeur
  timestamp: string;    // Horodatage de la modification
}

// Modèle complet d'une version de document
export interface DocumentVersion {
  id: string;                  // Identifiant unique de la version
  documentId: string;          // Référence au document parent
  versionNumber: number;       // Numéro de version séquentiel (1, 2, 3...)
  createdAt: string;           // Horodatage de création de la version
  createdBy: string;           // Utilisateur ayant créé cette version
  comment: string;             // Commentaire expliquant les modifications
  changes: DocumentChange[];   // Liste des modifications apportées
  snapshot: any;               // Snapshot complet de l'état du document à cette version
}

// Type pour la requête de création d'une nouvelle version
export interface CreateVersionRequest {
  documentId: string;          // ID du document à versionner
  comment: string;             // Commentaire sur les modifications
  changes: DocumentChange[];   // Liste des changements effectués
  snapshot: any;               // Nouvel état complet du document
  createdBy: string;           // Identifiant de l'utilisateur créant la version
}

// Type pour les options de récupération des versions
export interface GetVersionsOptions {
  documentId: string;          // ID du document
  limit?: number;              // Nombre max de versions à récupérer
  offset?: number;             // Offset pour la pagination
  sortDirection?: 'asc' | 'desc'; // Direction de tri (par défaut: desc = plus récent d'abord)
}

// Type pour la réponse contenant les différences entre deux versions
export interface VersionDiffResponse {
  fromVersion: number;
  toVersion: number;
  documentId: string;
  changes: DocumentChange[];
  createdAt: string;
  createdBy: string;
}
