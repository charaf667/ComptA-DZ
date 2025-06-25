/**
 * Contexte pour la gestion des notifications dans l'application
 */
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import notificationService from '../../services/notification.service';
import type { 
  Notification, 
  NotificationType,
  NotificationPriority,
  NotificationQuery,
  NotificationPreference,
  NotificationListResponse,
  ServiceResponse
} from '../../services/notification.service';

// Re-export les types pour faciliter leur utilisation
export type { Notification, NotificationType, NotificationPriority, NotificationListResponse };

// Réutiliser le type de requête de notification du service
export type NotificationQueryParams = NotificationQuery;

// Interface pour les préférences de notification dans notre application
export interface NotificationPreferences {
  // Préférences requises
  systemNotifications: boolean;
  dueDateNotifications: boolean;
  documentUpdateNotifications: boolean;
  // Mapping vers l'API: commentNotifications dans l'API <-> newCommentNotifications dans UI
  commentNotifications?: boolean; // Depuis l'API
  newCommentNotifications: boolean; // Version UI
}
import { useAuth } from '../../contexts/auth/AuthContext';

// Interface pour le contexte de notifications
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  preferences: NotificationPreference | null;
  loadNotifications: (query?: NotificationQuery) => Promise<{
    success: boolean;
    data?: {
      notifications: Notification[];
      unreadCount: number;
      pagination: { hasMore: boolean };
    };
    error?: string;
  }>;
  loadMore: () => Promise<{
    success: boolean;
    data?: {
      notifications: Notification[];
      unreadCount: number;
      pagination: { hasMore: boolean };
    };
    error?: string;
  }>;
  markAsRead: (id: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
    notificationId: string;
  }>;
  markAllAsRead: () => Promise<{
    success: boolean;
    message?: string;
    count?: number;
    error?: string;
  }>;
  deleteNotification: (id: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
    notificationId?: string;
  }>;
  deleteAllNotifications: () => Promise<{
    success: boolean;
    message?: string;
    count?: number;
    error?: string;
  }>;
  loadPreferences: () => Promise<void>;
  updatePreferences: (preferences: Partial<NotificationPreference>) => Promise<{
    success: boolean;
    data?: NotificationPreference;
    error?: string;
  }>;
  refreshUnreadCount: () => Promise<{
    success: boolean;
    count?: number;
    error?: string;
  }>;
}

// Création du contexte avec une valeur par défaut
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Taille de la page pour la pagination
const PAGE_SIZE = 10;

// Provider du contexte
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [offset, setOffset] = useState<number>(0);
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);

  // Référence mutable pour éviter la dépendance circulaire
  const unreadCountRef = useRef(unreadCount);

  // Mettre à jour la référence quand unreadCount change
  useEffect(() => {
    unreadCountRef.current = unreadCount;
  }, [unreadCount]);

  // Créer l'objet de réponse d'erreur par défaut
  const errorResponse = (error: string) => {
    setError(error);
    return { success: false, error };
  };
  
  // Helper pour créer des réponses d'erreur avec ID de notification
  const errorWithNotificationId = (error: string, id: string) => ({
    success: false, 
    error, 
    notificationId: id 
  });
  
  // Charger les notifications
  const loadNotifications = useCallback(async (query?: NotificationQuery) => {
    if (!isAuthenticated) {
      return errorResponse('Non authentifié');
    }

    setLoading(true);
    setError(null);

    try {
      const defaultQuery: NotificationQuery = {
        limit: PAGE_SIZE,
        offset: 0,
        ...query
      };

      const response = await notificationService.getNotifications(defaultQuery) as ServiceResponse<{ 
        notifications: Notification[]; 
        unreadCount: number; 
        pagination: { hasMore: boolean } 
      }>;

      if (response.success && response.data) {
        const { notifications, unreadCount, pagination } = response.data;

        if (notifications) {
          setNotifications(notifications);
        }

        if (unreadCount !== undefined) {
          setUnreadCount(unreadCount);
        }

        setHasMore(pagination?.hasMore ?? false);
        setOffset(defaultQuery.offset || 0);

        return { success: true, data: response.data };
      } else {
        const errorMsg = response.error || 'Erreur inconnue lors du chargement des notifications';
        console.error('Erreur lors du chargement des notifications:', errorMsg);
        return errorResponse(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      const fullErrorMsg = `Erreur lors du chargement des notifications: ${errorMsg}`;
      console.error(fullErrorMsg, err);
      return errorResponse(fullErrorMsg);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Charger plus de notifications (pagination)
  const loadMore = useCallback(async () => {
    if (!isAuthenticated) {
      const error = 'Non authentifié';
      setError(error);
      return { success: false, error };
    }

    if (loading) {
      return { success: false, error: 'Chargement en cours' };
    }

    if (!hasMore) {
      return { success: false, error: 'Pas plus de notifications disponibles' };
    }

    setLoading(true);
    setError(null);

    try {
      const nextOffset = offset + PAGE_SIZE;
      const query: NotificationQuery = {
        limit: PAGE_SIZE,
        offset: nextOffset
      };

      const response = await notificationService.getNotifications(query) as ServiceResponse<{ 
        notifications: Notification[]; 
        unreadCount: number; 
        pagination: { hasMore: boolean } 
      }>;

      if (response.success && response.data) {
        const { notifications: newNotifications, pagination } = response.data;

        if (newNotifications && newNotifications.length > 0) {
          setNotifications(prev => [...prev, ...newNotifications]);
          setOffset(nextOffset);
          setHasMore(pagination?.hasMore ?? false);
          return { success: true, data: response.data };
        } else {
          setHasMore(false);
          return { success: true, data: { notifications: [], unreadCount: response.data.unreadCount, pagination: { hasMore: false } } };
        }
      } else {
        const error = response.error || 'Erreur inconnue lors du chargement des notifications';
        setError(error);
        console.error('Erreur lors du chargement des notifications:', error);
        return { success: false, error };
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erreur inconnue';
      const fullError = `Erreur lors du chargement des notifications: ${error}`;
      setError(fullError);
      console.error(fullError, err);
      return { success: false, error: fullError };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, loading, hasMore, offset]);

  // Rafraîchir le compteur de notifications non lues
  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Non authentifié');
      return { success: false, error: 'Non authentifié' };
    }

    try {
      const countResponse = await notificationService.getUnreadCount() as ServiceResponse<number>;
      
      if (countResponse.success && countResponse.data !== undefined) {
        setUnreadCount(countResponse.data);
        return { success: true, count: countResponse.data };
      } else {
        const errorMessage = countResponse.error || 'Erreur inconnue lors du rafraîchissement du compteur';
        setError(errorMessage);
        console.error('Erreur lors du rafraîchissement du compteur:', errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      const fullErrorMessage = `Erreur lors du rafraîchissement du compteur de notifications: ${errorMessage}`;
      setError(fullErrorMessage);
      console.error(fullErrorMessage, err);
      return { success: false, error: fullErrorMessage };
    }
  }, [isAuthenticated]);

  // Marquer une notification comme lue
  const markAsRead = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      const error = 'Non authentifié';
      setError(error);
      return errorWithNotificationId(error, id);
    }

    if (!id) {
      const error = 'ID de notification manquant';
      setError(error);
      return errorWithNotificationId(error, id);
    }

    setLoading(true);
    setError(null);

    try {
      const response = await notificationService.markAsRead(id);
      
      if (response.success) {
        // Mettre à jour l'état local en utilisant la propriété isRead au lieu de read
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === id ? { ...notif, isRead: true } : notif
          )
        );
        
        // Mettre à jour le compteur en vérifiant isRead au lieu de read
        setUnreadCount(prev => {
          const notification = notifications.find(n => n.id === id);
          return notification && !notification.isRead ? Math.max(0, prev - 1) : prev;
        });
        
        // Retourner une réponse de succès cohérente
        return { 
          success: true, 
          message: 'Notification marquée comme lue avec succès',
          notificationId: id
        };
      } else {
        // Gérer l'erreur de l'API
        const error = response.error || 'Erreur inconnue lors du marquage comme lu';
        setError(error);
        console.error('Erreur lors du marquage comme lu:', error);
        return errorWithNotificationId(error, id);
      }
    } catch (err) {
      // Gérer les erreurs inattendues
      const error = err instanceof Error ? err.message : 'Erreur inconnue';
      const fullError = `Erreur lors du marquage de la notification comme lue: ${error}`;
      setError(fullError);
      console.error(fullError, err);
      return errorWithNotificationId(fullError, id);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, notifications]);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated) {
      const error = 'Non authentifié';
      setError(error);
      return { success: false, error };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await notificationService.markAllAsRead();

      if (response.success) {
        // Ne mettre à jour que les notifications non lues
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, isRead: true }))
        );
        
        // Mettre à jour le compteur
        const previousCount = unreadCount;
        setUnreadCount(0);
        
        return { 
          success: true, 
          message: 'Toutes les notifications ont été marquées comme lues',
          count: previousCount
        };
      } else {
        const error = response.error || 'Erreur inconnue lors du marquage de toutes les notifications comme lues';
        setError(error);
        console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
        return { success: false, error };
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erreur inconnue';
      const fullError = `Erreur lors du marquage de toutes les notifications comme lues: ${error}`;
      setError(fullError);
      console.error(fullError, err);
      return { success: false, error: fullError };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, unreadCount]);

  // Supprimer une notification
  const deleteNotification = useCallback(async (id: string) => {
    if (!isAuthenticated) {
      setError('Non authentifié');
      return errorWithNotificationId('Non authentifié', id);
    }

    if (!id) {
      setError('ID de notification manquant');
      return errorWithNotificationId('ID de notification manquant', id);
    }

    setLoading(true);
    setError(null);

    try {
      const notificationToRemove = notifications.find(n => n.id === id);
      const response = await notificationService.deleteNotification(id);
      
      if (response.success) {
        // Mettre à jour l'état local
        setNotifications(prev => prev.filter(notification => notification.id !== id));
        
        // Mettre à jour le compteur si la notification n'était pas lue
        if (notificationToRemove && !notificationToRemove.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
        
        return { 
          success: true, 
          message: 'Notification supprimée avec succès',
          notificationId: id 
        };
      } else {
        const error = response.error || 'Erreur inconnue lors de la suppression de la notification';
        setError(error);
        console.error('Erreur lors de la suppression de la notification:', error);
        return errorWithNotificationId(error, id);
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erreur inconnue';
      const fullError = `Erreur lors de la suppression de la notification: ${error}`;
      setError(fullError);
      console.error(fullError, err);
      return errorWithNotificationId(fullError, id);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, notifications]);

  // Supprimer toutes les notifications
  const deleteAllNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      const error = 'Non authentifié';
      setError(error);
      return { success: false, error };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await notificationService.deleteAllNotifications();
      
      if (response.success) {
        // Mettre à jour l'état local
        const previousCount = notifications.filter(n => !n.isRead).length;
        setNotifications([]);
        
        // Ne mettre à jour le compteur que si nécessaire
        if (previousCount > 0) {
          setUnreadCount(0);
        }
        
        return { 
          success: true, 
          message: 'Toutes les notifications ont été supprimées',
          count: previousCount
        };
      } else {
        const error = response.error || 'Erreur inconnue lors de la suppression de toutes les notifications';
        setError(error);
        console.error('Erreur lors de la suppression de toutes les notifications:', error);
        return { 
          success: false, 
          error,
          count: 0
        };
      }
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Erreur inconnue';
      const fullError = `Erreur lors de la suppression de toutes les notifications: ${error}`;
      setError(fullError);
      console.error(fullError, err);
      return { 
        success: false, 
        error: fullError,
        count: 0
      };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, notifications]);

  // Charger les préférences de notification
  const loadPreferences = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response: ServiceResponse<NotificationPreference> = await notificationService.getPreferences();
      if (response.success && response.data) {
        setPreferences(response.data);
      } else {
        const errorMessage = response.error || 'Erreur inconnue lors du chargement des préférences';
        console.error('Erreur lors du chargement des préférences:', errorMessage);
        setError(errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      const fullErrorMessage = `Erreur lors du chargement des préférences: ${errorMessage}`;
      setError(fullErrorMessage);
      console.error(fullErrorMessage, err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Mettre à jour les préférences de notification
  const updatePreferences = useCallback(async (prefs: Partial<NotificationPreference>) => {
    if (!isAuthenticated) {
      setError('Non authentifié');
      return { success: false, error: 'Non authentifié' };
    }

    setLoading(true);
    setError(null);

    try {
      const response: ServiceResponse<NotificationPreference> = await notificationService.updatePreferences(prefs);
      
      if (response.success && response.data) {
        setPreferences(response.data);
        return { success: true, data: response.data };
      } else {
        const errorMessage = response.error || 'Erreur inconnue lors de la mise à jour des préférences';
        console.error('Erreur lors de la mise à jour des préférences:', errorMessage);
        setError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      const fullErrorMessage = `Erreur lors de la mise à jour des préférences: ${errorMessage}`;
      setError(fullErrorMessage);
      console.error(fullErrorMessage, err);
      return { success: false, error: fullErrorMessage };
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Effet pour charger les notifications initiales et configurer le polling
  useEffect(() => {
    if (isAuthenticated) {
      // Charger les notifications initiales
      loadNotifications();
      
      // Charger les préférences
      loadPreferences();
      
      // Configurer un polling pour rafraîchir le compteur toutes les minutes
      const intervalId = setInterval(() => {
        refreshUnreadCount();
      }, 60000);
      
      return () => clearInterval(intervalId);
    }
  }, [isAuthenticated, loadNotifications, loadPreferences, refreshUnreadCount]);

  // Valeur du contexte
  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    error,
    hasMore,
    preferences,
    loadNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    loadPreferences,
    updatePreferences,
    refreshUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook personnalisé pour utiliser le contexte de notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (context === undefined) {
    throw new Error('useNotifications doit être utilisé dans un NotificationProvider');
  }
  
  return context;
};
