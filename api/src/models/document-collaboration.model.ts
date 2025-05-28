/**
 * Modèles pour les fonctionnalités de collaboration sur les documents
 * Comprend les commentaires et les assignations
 */

/**
 * Modèle pour un commentaire sur un document
 */
export interface DocumentComment {
  id: string;
  documentId: string;
  createdAt: string;
  createdBy: string;
  updatedAt?: string;
  content: string;
  parentId?: string; // Pour les réponses à d'autres commentaires
  isResolved?: boolean;
}

/**
 * Requête de création d'un nouveau commentaire
 */
export interface CreateCommentRequest {
  documentId: string;
  createdBy: string;
  content: string;
  parentId?: string;
}

/**
 * Requête de mise à jour d'un commentaire
 */
export interface UpdateCommentRequest {
  content?: string;
  isResolved?: boolean;
}

/**
 * Options pour récupérer les commentaires
 */
export interface GetCommentsOptions {
  documentId: string;
  parentId?: string;
  includeResolved?: boolean;
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Statut d'une assignation
 */
export enum AssignmentStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

/**
 * Modèle pour une assignation de document
 */
export interface DocumentAssignment {
  id: string;
  documentId: string;
  assignedTo: string;
  assignedBy: string;
  assignedAt: string;
  dueDate?: string;
  completedAt?: string;
  status: AssignmentStatus;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

/**
 * Requête de création d'une assignation
 */
export interface CreateAssignmentRequest {
  documentId: string;
  assignedTo: string;
  assignedBy: string;
  dueDate?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

/**
 * Requête de mise à jour d'une assignation
 */
export interface UpdateAssignmentRequest {
  status?: AssignmentStatus;
  dueDate?: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

/**
 * Options pour récupérer les assignations
 */
export interface GetAssignmentsOptions {
  documentId?: string;
  assignedTo?: string;
  status?: AssignmentStatus[];
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
