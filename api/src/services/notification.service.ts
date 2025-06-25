/**
 * Service de gestion des notifications
 */
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import webSocketService from './websocket.service';
import { 
  Notification, 
  NotificationType, 
  NotificationPriority, 
  CreateNotificationDto, 
  UpdateNotificationDto, 
  NotificationQuery,
  NotificationPreference 
} from '../models/notification.model';

// Chemin vers le fichier JSON pour stocker les notifications
const NOTIFICATIONS_FILE = path.join(__dirname, '..', '..', 'data', 'notifications.json');
const NOTIFICATION_PREFERENCES_FILE = path.join(__dirname, '..', '..', 'data', 'notification-preferences.json');

// S'assurer que le répertoire data existe
const dataDir = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialiser les fichiers s'ils n'existent pas
if (!fs.existsSync(NOTIFICATIONS_FILE)) {
  fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify([], null, 2));
}

if (!fs.existsSync(NOTIFICATION_PREFERENCES_FILE)) {
  fs.writeFileSync(NOTIFICATION_PREFERENCES_FILE, JSON.stringify([], null, 2));
}

class NotificationService {
  private notifications: Notification[] = [];
  private preferences: NotificationPreference[] = [];

  constructor() {
    this.loadNotifications();
    this.loadPreferences();
  }

  /**
   * Charger les notifications depuis le fichier JSON
   */
  private loadNotifications(): void {
    try {
      const data = fs.readFileSync(NOTIFICATIONS_FILE, 'utf8');
      this.notifications = JSON.parse(data);
    } catch (error) {
      console.error('Erreur lors du chargement des notifications:', error);
      this.notifications = [];
    }
  }

  /**
   * Sauvegarder les notifications dans le fichier JSON
   */
  private saveNotifications(): void {
    try {
      fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(this.notifications, null, 2));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notifications:', error);
    }
  }

  /**
   * Charger les préférences de notification depuis le fichier JSON
   */
  private loadPreferences(): void {
    try {
      const data = fs.readFileSync(NOTIFICATION_PREFERENCES_FILE, 'utf8');
      this.preferences = JSON.parse(data);
    } catch (error) {
      console.error('Erreur lors du chargement des préférences de notification:', error);
      this.preferences = [];
    }
  }

  /**
   * Sauvegarder les préférences de notification dans le fichier JSON
   */
  private savePreferences(): void {
    try {
      fs.writeFileSync(NOTIFICATION_PREFERENCES_FILE, JSON.stringify(this.preferences, null, 2));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences de notification:', error);
    }
  }

  /**
   * Créer une nouvelle notification
   * @param notificationData Données de la notification à créer
   * @returns La notification créée ou undefined si les préférences de l'utilisateur empêchent sa création
   */
  async createNotification(notificationData: CreateNotificationDto): Promise<Notification | undefined> {
    // Vérifier si l'utilisateur a activé ce type de notification
    const userPreferences = await this.getUserPreferences(notificationData.userId);
    
    // Si les préférences existent, vérifier si ce type de notification est activé
    if (userPreferences) {
      switch (notificationData.type) {
        case NotificationType.COMMENT:
        case NotificationType.COMMENT_RESOLVED:
          if (!userPreferences.commentNotifications) return undefined;
          break;
        case NotificationType.ASSIGNMENT:
        case NotificationType.ASSIGNMENT_STATUS:
          if (!userPreferences.assignmentNotifications) return undefined;
          break;
        case NotificationType.DOCUMENT_UPDATED:
          if (!userPreferences.documentUpdateNotifications) return undefined;
          break;
        case NotificationType.DUE_DATE:
          if (!userPreferences.dueDateNotifications) return undefined;
          break;
        case NotificationType.SYSTEM:
          if (!userPreferences.systemNotifications) return undefined;
          break;
      }
    }

    const notification: Notification = {
      id: uuidv4(),
      userId: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      isRead: false,
      createdAt: new Date().toISOString(),
      priority: notificationData.priority || NotificationPriority.MEDIUM,
      ...notificationData.referenceId && { referenceId: notificationData.referenceId },
      ...notificationData.referenceType && { referenceType: notificationData.referenceType },
      ...notificationData.link && { link: notificationData.link },
      ...notificationData.expiresAt && { expiresAt: notificationData.expiresAt }
    };

    this.notifications.push(notification);
    this.saveNotifications();

    // Envoyer la notification via WebSocket
    webSocketService.sendNotification(notification.userId, notification);

    return notification;
  }

  /**
   * Obtenir toutes les notifications d'un utilisateur
   * @param userId ID de l'utilisateur
   * @param query Options de requête (filtres, pagination)
   * @returns Liste des notifications
   */
  getNotifications(userId: string, query: NotificationQuery = {}): { notifications: Notification[], total: number } {
    // Filtrer les notifications par utilisateur
    let filteredNotifications = this.notifications.filter(n => n.userId === userId);
    
    // Filtrer par statut de lecture
    if (query.isRead !== undefined) {
      filteredNotifications = filteredNotifications.filter(n => n.isRead === query.isRead);
    }
    
    // Filtrer par type
    if (query.type) {
      if (Array.isArray(query.type)) {
        filteredNotifications = filteredNotifications.filter(n => query.type && query.type.includes(n.type));
      } else {
        filteredNotifications = filteredNotifications.filter(n => n.type === query.type);
      }
    }

    // Filtrer par date
    if (query.after) {
      filteredNotifications = filteredNotifications.filter(n => 
        new Date(n.createdAt) >= new Date(query.after as string)
      );
    }

    if (query.before) {
      filteredNotifications = filteredNotifications.filter(n => 
        new Date(n.createdAt) <= new Date(query.before as string)
      );
    }

    // Trier par date (plus récent d'abord)
    filteredNotifications.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Pagination
    const offset = query.offset || 0;
    const limit = query.limit || 20;
    
    const total = filteredNotifications.length;
    const paginatedNotifications = filteredNotifications.slice(offset, offset + limit);

    return { 
      notifications: paginatedNotifications,
      total
    };
  }

  /**
   * Obtenir une notification par son ID
   * @param notificationId ID de la notification
   * @returns La notification ou undefined si non trouvée
   */
  getNotificationById(notificationId: string): Notification | undefined {
    return this.notifications.find(n => n.id === notificationId);
  }

  /**
   * Mettre à jour une notification
   * @param notificationId ID de la notification
   * @param updateData Données à mettre à jour
   * @returns La notification mise à jour ou undefined si non trouvée
   */
  updateNotification(notificationId: string, updateData: UpdateNotificationDto): Notification | undefined {
    const notificationIndex = this.notifications.findIndex(n => n.id === notificationId);
    
    if (notificationIndex === -1) {
      return undefined;
    }
    
    const updatedNotification = {
      ...this.notifications[notificationIndex],
      ...updateData
    };
    
    this.notifications[notificationIndex] = updatedNotification;
    this.saveNotifications();
    
    return updatedNotification;
  }

  /**
   * Marquer une notification comme lue
   * @param notificationId ID de la notification
   * @param userId ID de l'utilisateur
   * @returns La notification mise à jour ou undefined si non trouvée
   */
  markAsRead(notificationId: string, userId: string): Notification | undefined {
    const notification = this.notifications.find(n => n.id === notificationId && n.userId === userId);
    
    if (!notification) {
      return undefined;
    }

    const updatedNotification = {
      ...notification,
      isRead: true
    };

    const notificationIndex = this.notifications.findIndex(n => n.id === notificationId);
    this.notifications[notificationIndex] = updatedNotification;
    this.saveNotifications();
    
    return updatedNotification;
  }

  /**
   * Marquer toutes les notifications d'un utilisateur comme lues
   * @param userId ID de l'utilisateur
   * @returns Nombre de notifications marquées comme lues
   */
  markAllAsRead(userId: string): number {
    let count = 0;
    
    this.notifications.forEach((notification, index) => {
      if (notification.userId === userId && !notification.isRead) {
        this.notifications[index] = {
          ...notification,
          isRead: true
        };
        count++;
      }
    });
    
    if (count > 0) {
      this.saveNotifications();
    }
    
    return count;
  }

  /**
   * Supprimer une notification
   * @param notificationId ID de la notification
   * @param userId ID de l'utilisateur
   * @returns true si supprimée, false sinon
   */
  deleteNotification(notificationId: string, userId: string): boolean {
    const initialLength = this.notifications.length;
    
    this.notifications = this.notifications.filter(
      n => !(n.id === notificationId && n.userId === userId)
    );
    
    if (this.notifications.length < initialLength) {
      this.saveNotifications();
      return true;
    }
    
    return false;
  }

  /**
   * Supprimer toutes les notifications d'un utilisateur
   * @param userId ID de l'utilisateur
   * @returns Nombre de notifications supprimées
   */
  deleteAllNotifications(userId: string): number {
    const initialLength = this.notifications.length;
    
    this.notifications = this.notifications.filter(n => n.userId !== userId);
    
    const deletedCount = initialLength - this.notifications.length;
    
    if (deletedCount > 0) {
      this.saveNotifications();
    }
    
    return deletedCount;
  }

  /**
   * Obtenir les préférences de notification d'un utilisateur
   * @param userId ID de l'utilisateur
   * @returns Préférences de notification ou undefined si non trouvées
   */
  getUserPreferences(userId: string): NotificationPreference | undefined {
    return this.preferences.find(p => p.userId === userId);
  }

  /**
   * Créer ou mettre à jour les préférences de notification d'un utilisateur
   * @param userId ID de l'utilisateur
   * @param preferences Préférences de notification
   * @returns Préférences de notification mises à jour
   */
  updateUserPreferences(userId: string, preferencesData: Partial<NotificationPreference>): NotificationPreference {
    const existingPreferencesIndex = this.preferences.findIndex(p => p.userId === userId);
    
    // Valeurs par défaut pour les nouvelles préférences
    const defaultPreferences: NotificationPreference = {
      userId,
      commentNotifications: true,
      assignmentNotifications: true,
      documentUpdateNotifications: true,
      dueDateNotifications: true,
      systemNotifications: true,
      emailNotifications: false,
      pushNotifications: false
    };
    
    let updatedPreferences: NotificationPreference;
    
    if (existingPreferencesIndex === -1) {
      // Créer de nouvelles préférences
      updatedPreferences = {
        ...defaultPreferences,
        ...preferencesData
      };
      
      this.preferences.push(updatedPreferences);
    } else {
      // Mettre à jour les préférences existantes
      updatedPreferences = {
        ...this.preferences[existingPreferencesIndex],
        ...preferencesData
      };
      
      this.preferences[existingPreferencesIndex] = updatedPreferences;
    }
    
    this.savePreferences();
    
    return updatedPreferences;
  }

  /**
   * Créer une notification pour un commentaire
   * @param documentId ID du document
   * @param commentId ID du commentaire
   * @param commentContent Contenu du commentaire
   * @param createdBy Auteur du commentaire
   * @param assignedTo Destinataire de la notification
   * @returns La notification créée ou undefined
   */
  async createCommentNotification(
    documentId: string,
    commentId: string,
    commentContent: string,
    createdBy: string,
    assignedTo: string
  ): Promise<Notification | undefined> {
    return this.createNotification({
      userId: assignedTo,
      type: NotificationType.COMMENT,
      title: 'Nouveau commentaire',
      message: `${createdBy} a commenté un document : "${commentContent.substring(0, 50)}${commentContent.length > 50 ? '...' : ''}"`,
      referenceId: commentId,
      referenceType: 'comment',
      priority: NotificationPriority.MEDIUM,
      link: `/documents/${documentId}?commentId=${commentId}`
    });
  }

  /**
   * Créer une notification pour un commentaire résolu
   * @param documentId ID du document
   * @param commentId ID du commentaire
   * @param resolvedBy Utilisateur qui a résolu le commentaire
   * @param commentAuthor Auteur du commentaire
   * @returns La notification créée ou undefined
   */
  async createCommentResolvedNotification(
    documentId: string,
    commentId: string,
    resolvedBy: string,
    commentAuthor: string
  ): Promise<Notification | undefined> {
    return this.createNotification({
      userId: commentAuthor,
      type: NotificationType.COMMENT_RESOLVED,
      title: 'Commentaire résolu',
      message: `${resolvedBy} a marqué votre commentaire comme résolu.`,
      referenceId: commentId,
      referenceType: 'comment',
      priority: NotificationPriority.LOW,
      link: `/documents/${documentId}?commentId=${commentId}`
    });
  }

  /**
   * Créer une notification pour une assignation
   * @param documentId ID du document
   * @param assignmentId ID de l'assignation
   * @param assignedBy Utilisateur qui a créé l'assignation
   * @param assignedTo Utilisateur assigné
   * @param dueDate Date d'échéance (optionnelle)
   * @param priority Priorité de l'assignation
   * @returns La notification créée ou undefined
   */
  async createAssignmentNotification(
    documentId: string,
    assignmentId: string,
    assignedBy: string,
    assignedTo: string,
    dueDate?: string,
    priority?: NotificationPriority
  ): Promise<Notification | undefined> {
    let message = `${assignedBy} vous a assigné un document.`;
    
    if (dueDate) {
      const dueDateObj = new Date(dueDate);
      message += ` Échéance: ${dueDateObj.toLocaleDateString()}.`;
    }

    return this.createNotification({
      userId: assignedTo,
      type: NotificationType.ASSIGNMENT,
      title: 'Nouvelle assignation',
      message,
      referenceId: assignmentId,
      referenceType: 'assignment',
      priority: priority || NotificationPriority.MEDIUM,
      link: `/documents/${documentId}?assignmentId=${assignmentId}`,
      expiresAt: dueDate
    });
  }

  /**
   * Créer une notification pour une échéance approchante
   * @param documentId ID du document
   * @param assignmentId ID de l'assignation
   * @param assignedTo Utilisateur assigné
   * @param dueDate Date d'échéance
   * @param priority Priorité de la notification
   * @returns La notification créée ou undefined
   */
  async createDueDateNotification(
    documentId: string,
    assignmentId: string,
    assignedTo: string,
    dueDate: string,
    priority: NotificationPriority
  ): Promise<Notification | undefined> {
    const dueDateObj = new Date(dueDate);
    const formattedDate = dueDateObj.toLocaleDateString();
    
    return this.createNotification({
      userId: assignedTo,
      type: NotificationType.DUE_DATE,
      title: 'Échéance approchante',
      message: `Une assignation approche de sa date d'échéance (${formattedDate}).`,
      referenceId: assignmentId,
      referenceType: 'assignment',
      priority: priority || NotificationPriority.HIGH,
      link: `/documents/${documentId}?assignmentId=${assignmentId}`,
      expiresAt: dueDate
    });
  }

  /**
   * Créer une notification système
   * @param userId ID de l'utilisateur
   * @param title Titre de la notification
   * @param message Message de la notification
   * @param priority Priorité
   * @param link Lien (optionnel)
   * @returns La notification créée ou undefined
   */
  async createSystemNotification(
    userId: string,
    title: string,
    message: string,
    priority: NotificationPriority = NotificationPriority.MEDIUM,
    link?: string
  ): Promise<Notification | undefined> {
    return this.createNotification({
      userId,
      type: NotificationType.SYSTEM,
      title,
      message,
      priority,
      link
    });
  }

  /**
   * Créer des notifications système pour plusieurs utilisateurs
   * @param userIds Liste des utilisateurs
   * @param title Titre de la notification
   * @param message Message de la notification
   * @param priority Priorité
   * @param link Lien (optionnel)
   * @returns Liste des notifications créées
   */
  async createSystemNotifications(
    userIds: string[],
    title: string,
    message: string,
    priority: NotificationPriority = NotificationPriority.MEDIUM,
    link?: string
  ): Promise<Notification[]> {
    const notifications: Notification[] = [];
    
    for (const userId of userIds) {
      const notification = await this.createNotification({
        userId,
        type: NotificationType.SYSTEM,
        title,
        message,
        priority,
        link
      });
      
      if (notification) {
        notifications.push(notification);
      }
    }
    
    return notifications;
  }

  /**
   * Compter les notifications non lues d'un utilisateur
   * @param userId ID de l'utilisateur
   * @returns Nombre de notifications non lues
   */
  countUnreadNotifications(userId: string): number {
    return this.notifications.filter(n => n.userId === userId && !n.isRead).length;
  }
}

// Exporter une instance du service
const notificationService = new NotificationService();
export default notificationService;
