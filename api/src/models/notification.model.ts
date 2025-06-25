/**
 * Modèle pour les notifications système
 */

// Types de notifications
export enum NotificationType {
  COMMENT = 'COMMENT',                   // Nouveau commentaire ou réponse
  COMMENT_RESOLVED = 'COMMENT_RESOLVED', // Commentaire marqué comme résolu
  ASSIGNMENT = 'ASSIGNMENT',             // Nouvelle assignation de document
  ASSIGNMENT_STATUS = 'ASSIGNMENT_STATUS', // Changement de statut d'assignation
  DOCUMENT_UPDATED = 'DOCUMENT_UPDATED', // Document mis à jour
  DUE_DATE = 'DUE_DATE',                 // Échéance approchante
  SYSTEM = 'SYSTEM'                      // Notification système générale
}

// Niveau de priorité des notifications
export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

// Interface pour la notification
export interface Notification {
  id: string;
  userId: string;       // Destinataire de la notification
  type: NotificationType;
  title: string;        // Titre court de la notification
  message: string;      // Message détaillé
  isRead: boolean;      // Si la notification a été lue
  createdAt: string;    // Date de création
  referenceId?: string; // ID de l'objet concerné (document, commentaire, etc.)
  referenceType?: string; // Type de l'objet référencé
  priority: NotificationPriority;
  link?: string;        // Lien vers l'élément concerné
  expiresAt?: string;   // Date d'expiration (optionnelle)
}

// Interface pour les préférences de notification de l'utilisateur
export interface NotificationPreference {
  userId: string;
  commentNotifications: boolean;
  assignmentNotifications: boolean;
  documentUpdateNotifications: boolean;
  dueDateNotifications: boolean;
  systemNotifications: boolean;
  emailNotifications: boolean;   // Si l'utilisateur souhaite recevoir des emails
  pushNotifications: boolean;    // Pour les notifications push futures
}

// Interface pour la création d'une notification
export interface CreateNotificationDto {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  referenceId?: string;
  referenceType?: string;
  priority?: NotificationPriority;
  link?: string;
  expiresAt?: string;
}

// Interface pour la mise à jour d'une notification
export interface UpdateNotificationDto {
  isRead?: boolean;
  expiresAt?: string;
}

// Interface pour les requêtes de recherche de notifications
export interface NotificationQuery {
  userId?: string; // Rendu optionnel car fourni séparément dans certains appels
  isRead?: boolean;
  type?: NotificationType | NotificationType[];
  after?: string;
  before?: string;
  limit?: number;
  offset?: number;
}
