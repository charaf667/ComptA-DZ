import React, { createContext, useContext, useEffect, useState } from 'react';
import notificationService from '../../services/notification.service';
import type {
  Notification,
  NotificationType,
  NotificationPriority,
  NotificationQuery,
  NotificationResponse
} from '../../services/notification.service';
import websocketService, { WebSocketEventType } from '../../services/websocket.service';
import { useAuth } from '../auth/AuthContext';

// Re-export les types pour faciliter leur utilisation
export type { Notification, NotificationType, NotificationPriority, NotificationResponse };

// Réutiliser le type de requête de notification du service
export type NotificationQueryParams = NotificationQuery;

// Interface pour les préférences de notification qui étend NotificationPreference du service
import type { NotificationPreference } from '../../services/notification.service';

// Interface pour les préférences de notification dans notre application
export interface NotificationPreferences {
  // Préférences requises
  systemNotifications: boolean;
  dueDateNotifications: boolean;
  documentUpdateNotifications: boolean;
  // Mapping vers l'API: commentNotifications dans l'API <-> newCommentNotifications dans UI
  commentNotifications?: boolean; // Depuis l'API
  newCommentNotifications: boolean; // Version UI
  assignmentNotifications?: boolean;
  // Autres champs facultatifs de l'interface API
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  userId?: string;
  // Permettre d'autres clés pour les futures extensions
  [key: string]: boolean | string | undefined;
}

// Interface du contexte de notifications
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  preferences: NotificationPreferences;
  loadNotifications: (params?: NotificationQueryParams) => Promise<void>;
  loadMore: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  deleteAllNotifications: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  loadPreferences: () => Promise<void>;
  updatePreferences: (key: string, value: boolean) => Promise<void>;
}

// Création du contexte avec des valeurs par défaut
const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  hasMore: false,
  preferences: {
    systemNotifications: true,
    dueDateNotifications: true,
    documentUpdateNotifications: true,
    newCommentNotifications: true
  },
  loadNotifications: async () => {},
  loadMore: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  deleteNotification: async () => {},
  deleteAllNotifications: async () => {},
  refreshNotifications: async () => {},
  loadPreferences: async () => {},
  updatePreferences: async () => {}
});

// Hook personnalisé pour utiliser le contexte de notifications
export const useNotifications = () => useContext(NotificationContext);

// Fournisseur du contexte de notifications
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    systemNotifications: true,
    dueDateNotifications: true,
    documentUpdateNotifications: true,
    newCommentNotifications: true
  });
  const { isAuthenticated } = useAuth();

  // Charger les notifications avec filtres optionnels
  const loadNotifications = async (params?: NotificationQueryParams) => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    setPage(1); // Réinitialiser la pagination
    
    try {
      const response = await notificationService.getNotifications(params);
      if (response.success && response.data) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
        // Déterminer s'il y a plus de notifications à charger
        setHasMore(response.data.notifications.length >= 10); // Supposons que 10 est la taille de page
      } else {
        setError('Erreur lors du chargement des notifications');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des notifications:', err);
      setError('Une erreur est survenue lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };
  
  // Charger plus de notifications (pagination)
  const loadMore = async () => {
    if (!isAuthenticated || loading || !hasMore) return;
    
    setLoading(true);
    const nextPage = page + 1;
    
    try {
      const response = await notificationService.getNotifications({
        page: nextPage,
        limit: 10 // Même taille de page que dans loadNotifications
      });
      
      if (response.success && response.data) {
        const newNotifications = response.data.notifications;
        if (newNotifications.length > 0) {
          // Ajouter les nouvelles notifications à la liste existante
          setNotifications(prev => [...prev, ...newNotifications]);
          setPage(nextPage);
          // Déterminer s'il y a encore plus à charger
          setHasMore(newNotifications.length >= 10);
        } else {
          setHasMore(false);
        }
      } else {
        setError('Erreur lors du chargement des notifications');
      }
    } catch (err) {
      console.error('Erreur lors du chargement de plus de notifications:', err);
      setError('Une erreur est survenue lors du chargement des notifications');
    } finally {
      setLoading(false);
    }
  };
  
  // Charger les préférences de notification
  const loadPreferences = async () => {
    if (!isAuthenticated) return;
    
    try {
      // Appel au service pour charger les préférences
      const response = await notificationService.getPreferences();
      if (response.success && response.data) {
        // Transformer les données de l'API en format attendu par l'UI
        const apiPrefs = response.data;
        setPreferences({
          // Conserver tous les champs de l'API
          ...apiPrefs,
          // Mais s'assurer que les préférences requises sont bien définies avec valeurs par défaut si nécessaire
          systemNotifications: apiPrefs.systemNotifications ?? true,
          dueDateNotifications: apiPrefs.dueDateNotifications ?? true,
          documentUpdateNotifications: apiPrefs.documentUpdateNotifications ?? true,
          // Convertir commentNotifications de l'API en newCommentNotifications pour l'UI
          newCommentNotifications: apiPrefs.commentNotifications ?? true
        });
      }
    } catch (err) {
      console.error('Erreur lors du chargement des préférences de notification:', err);
      setError('Une erreur est survenue lors du chargement des préférences');
    }
  };
  
  // Mettre à jour une préférence de notification
  const updatePreferences = async (key: string, value: boolean) => {
    if (!isAuthenticated) return;
    
    try {
      // Mise à jour locale immédiate pour réactivité UI
      setPreferences(prev => ({ ...prev, [key]: value }));
      
      // Préparer l'objet pour l'API
      const apiPrefs: Partial<NotificationPreference> = {};
      
      // Mapper les champs UI vers l'API
      if (key === 'newCommentNotifications') {
        // Cas spécial: newCommentNotifications dans l'UI est commentNotifications dans l'API
        apiPrefs.commentNotifications = value;
      } else {
        // Liste des clés valides pour l'API
        const validApiKeys: (keyof NotificationPreference)[] = [
          'systemNotifications',
          'dueDateNotifications',
          'documentUpdateNotifications',
          'assignmentNotifications',
          'emailNotifications',
          'pushNotifications',
          'commentNotifications'
        ];
        
        // Vérifier si la clé est valide pour l'API
        if (validApiKeys.includes(key as keyof NotificationPreference)) {
          // Type assertion pour indiquer à TypeScript que c'est une clé valide
          (apiPrefs as any)[key] = value;
        }
      }
      // Ignorer les autres clés qui ne font pas partie de l'interface NotificationPreference
      
      // Appel au service pour persister le changement
      const response = await notificationService.updatePreferences(apiPrefs);
      
      if (!response.success) {
        // Revenir à l'état précédent si l'API échoue
        setPreferences(preferences);
        setError('Erreur lors de la mise à jour des préférences');
      }
    } catch (err) {
      console.error('Erreur lors de la mise à jour des préférences:', err);
      // Revenir à l'état précédent
      setPreferences(preferences);
      setError('Une erreur est survenue lors de la mise à jour des préférences');
    }
  };

  // Configurer les écouteurs WebSocket et charger les notifications au montage
  useEffect(() => {
    if (isAuthenticated) {
      // Se connecter au WebSocket
      websocketService.connect();
      
      // Écouter les nouvelles notifications
      websocketService.on(WebSocketEventType.NOTIFICATION, handleNewNotification);
      
      // Charger les notifications initiales et les préférences
      loadNotifications();
      loadPreferences();
      
      // Nettoyage à la déconnexion
      return () => {
        websocketService.off(WebSocketEventType.NOTIFICATION, handleNewNotification);
      };
    }
  }, [isAuthenticated]);

  // Gérer une nouvelle notification reçue via WebSocket
  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.isRead) {
      setUnreadCount(prev => prev + 1);
    }
    
    // Afficher une notification système si supportée par le navigateur
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png'
      });
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (notificationId: string) => {
    try {
      const response = await notificationService.markAsRead(notificationId);
      if (response.success) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Erreur lors du marquage de la notification comme lue:', err);
      setError('Erreur lors de la mise à jour de la notification');
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      const response = await notificationService.markAllAsRead();
      if (response.success) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, isRead: true }))
        );
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', err);
      setError('Erreur lors de la mise à jour des notifications');
    }
  };

  // Supprimer une notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const response = await notificationService.deleteNotification(notificationId);
      if (response.success) {
        const deletedNotification = notifications.find(n => n.id === notificationId);
        setNotifications(prev =>
          prev.filter(n => n.id !== notificationId)
        );
        if (deletedNotification && !deletedNotification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('Erreur lors de la suppression de la notification:', err);
      setError('Erreur lors de la suppression de la notification');
    }
  };

  // Supprimer toutes les notifications
  const deleteAllNotifications = async () => {
    try {
      const response = await notificationService.deleteAllNotifications();
      if (response.success) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Erreur lors de la suppression de toutes les notifications:', err);
      setError('Erreur lors de la suppression des notifications');
    }
  };

  // Rafraîchir les notifications
  const refreshNotifications = async () => {
    await loadNotifications();
  };

  const value = {
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
    refreshNotifications,
    loadPreferences,
    updatePreferences
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
