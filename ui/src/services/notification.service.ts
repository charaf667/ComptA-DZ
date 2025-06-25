/**
 * Service de gestion des notifications côté client
 */
import api from './api';
import type { AxiosResponse } from 'axios';
import { getAuthHeaders } from '../utils/auth';

// Types de notifications
export const NotificationType = {
  COMMENT: 'COMMENT',
  COMMENT_RESOLVED: 'COMMENT_RESOLVED',
  ASSIGNMENT: 'ASSIGNMENT',
  ASSIGNMENT_STATUS: 'ASSIGNMENT_STATUS',
  DOCUMENT_UPDATED: 'DOCUMENT_UPDATED',
  DUE_DATE: 'DUE_DATE',
  SYSTEM: 'SYSTEM'
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

// Niveau de priorité des notifications
export const NotificationPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH'
} as const;

export type NotificationPriority = typeof NotificationPriority[keyof typeof NotificationPriority];

// Interface pour la notification
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  referenceId?: string;
  referenceType?: string;
  priority: NotificationPriority;
  link?: string;
  expiresAt?: string;
}

// Interface pour les préférences de notification
export interface NotificationPreference {
  userId: string;
  commentNotifications: boolean;
  assignmentNotifications: boolean;
  documentUpdateNotifications: boolean;
  dueDateNotifications: boolean;
  systemNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
}

// Interface pour les requêtes de recherche
export interface NotificationQuery {
  isRead?: boolean;
  type?: NotificationType | NotificationType[];
  after?: string;
  before?: string;
  limit?: number;
  offset?: number;
  page?: number;
}

// Interface pour la liste des notifications
export interface NotificationListResponse {
  notifications: Notification[];
  unreadCount: number;
  pagination: {
    hasMore: boolean;
  };
}

// Interface pour les réponses des services
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Service de gestion des notifications
 */
class NotificationService {
  /**
   * Récupérer les notifications de l'utilisateur connecté
   * @param query Critères de recherche
   * @returns Réponse contenant les notifications et la pagination
   */
  async getNotifications(query?: NotificationQuery): Promise<ServiceResponse<NotificationListResponse>> {
    try {
      const response: AxiosResponse<NotificationListResponse> = await api.get('/notifications', { 
        params: query,
        headers: getAuthHeaders() 
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return { success: false, error: 'Erreur lors de la récupération des notifications' };
    }
  }

  /**
   * Récupérer une notification par son ID
   * @param id ID de la notification
   * @returns La notification
   */
  async getNotificationById(id: string): Promise<ServiceResponse<Notification>> {
    try {
      const response: AxiosResponse<Notification> = await api.get(`/notifications/${id}`, {
        headers: getAuthHeaders()
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Erreur lors de la récupération de la notification ${id}:`, error);
      return { success: false, error: `Erreur lors de la récupération de la notification ${id}` };
    }
  }

  /**
   * Marquer une notification comme lue
   * @param id ID de la notification
   * @returns La notification mise à jour
   */
  async markAsRead(id: string): Promise<ServiceResponse<Notification>> {
    try {
      const response: AxiosResponse<Notification> = await api.patch(`/notifications/${id}/read`, {}, {
        headers: getAuthHeaders()
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Erreur lors du marquage de la notification ${id} comme lue:`, error);
      return { success: false, error: `Erreur lors du marquage de la notification comme lue` };
    }
  }

  /**
   * Marquer toutes les notifications comme lues
   * @returns Nombre de notifications marquées comme lues
   */
  async markAllAsRead(): Promise<ServiceResponse<{ count: number }>> {
    try {
      const response: AxiosResponse<{ message: string; count: number }> = await api.patch('/notifications/read-all', {}, {
        headers: getAuthHeaders()
      });
      return { success: true, data: { count: response.data.count } };
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
      return { success: false, error: 'Erreur lors du marquage de toutes les notifications comme lues' };
    }
  }

  /**
   * Supprimer une notification
   * @param id ID de la notification
   * @returns Succès de l'opération
   */
  async deleteNotification(id: string): Promise<ServiceResponse<void>> {
    try {
      await api.delete(`/notifications/${id}`, {
        headers: getAuthHeaders()
      });
      return { success: true };
    } catch (error) {
      console.error(`Erreur lors de la suppression de la notification ${id}:`, error);
      return { success: false, error: 'Erreur lors de la suppression de la notification' };
    }
  }

  /**
   * Supprimer toutes les notifications
   * @returns Nombre de notifications supprimées
   */
  async deleteAllNotifications(): Promise<ServiceResponse<{ count: number }>> {
    try {
      const response: AxiosResponse<{ message: string; count: number }> = await api.delete('/notifications/all', {
        headers: getAuthHeaders()
      });
      return { success: true, data: { count: response.data.count } };
    } catch (error) {
      console.error('Erreur lors de la suppression de toutes les notifications:', error);
      return { success: false, error: 'Erreur lors de la suppression de toutes les notifications' };
    }
  }

  /**
   * Récupérer le nombre de notifications non lues
   * @returns Nombre de notifications non lues
   */
  async getUnreadCount(): Promise<ServiceResponse<number>> {
    try {
      const response: AxiosResponse<{ count: number }> = await api.get('/notifications/unread-count', {
        headers: getAuthHeaders()
      });
      return { success: true, data: response.data.count };
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre de notifications non lues:', error);
      return { success: false, error: 'Erreur lors de la récupération du nombre de notifications non lues' };
    }
  }

  /**
   * Récupérer les préférences de notification
   * @returns Préférences de notification
   */
  async getPreferences(): Promise<ServiceResponse<NotificationPreference>> {
    try {
      const response: AxiosResponse<NotificationPreference> = await api.get('/notifications/preferences', {
        headers: getAuthHeaders()
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la récupération des préférences de notification:', error);
      return { success: false, error: 'Erreur lors de la récupération des préférences de notification' };
    }
  }

  /**
   * Mettre à jour les préférences de notification
   * @param preferences Préférences à mettre à jour
   * @returns Préférences mises à jour
   */
  async updatePreferences(preferences: Partial<NotificationPreference>): Promise<ServiceResponse<NotificationPreference>> {
    try {
      const response: AxiosResponse<NotificationPreference> = await api.patch('/notifications/preferences', preferences, {
        headers: getAuthHeaders()
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences de notification:', error);
      return { success: false, error: 'Erreur lors de la mise à jour des préférences de notification' };
    }
  }

  /**
   * Créer une notification de test (en développement uniquement)
   * @param type Type de notification
   * @param priority Priorité de la notification
   * @returns La notification créée
   */
  async createTestNotification(type: NotificationType, priority: NotificationPriority): Promise<ServiceResponse<Notification>> {
    try {
      const response: AxiosResponse<Notification> = await api.post('/notifications/test', { type, priority }, {
        headers: getAuthHeaders()
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la création de la notification de test:', error);
      return { success: false, error: 'Erreur lors de la création de la notification de test' };
    }
  }
}

export default new NotificationService();
