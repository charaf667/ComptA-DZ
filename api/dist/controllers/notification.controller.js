"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notification_service_1 = __importDefault(require("../services/notification.service"));
const notification_model_1 = require("../models/notification.model");
class NotificationController {
    /**
     * Récupérer les notifications d'un utilisateur
     * @route GET /api/notifications
     */
    async getNotifications(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'Utilisateur non authentifié' });
                return;
            }
            // Paramètres de requête
            const isRead = req.query.isRead !== undefined
                ? req.query.isRead === 'true'
                : undefined;
            let type;
            if (req.query.type) {
                if (Array.isArray(req.query.type)) {
                    type = req.query.type;
                }
                else {
                    type = req.query.type;
                }
            }
            const limit = req.query.limit ? parseInt(req.query.limit) : 20;
            const offset = req.query.offset ? parseInt(req.query.offset) : 0;
            const after = req.query.after;
            const before = req.query.before;
            const query = {
                isRead,
                type,
                limit,
                offset,
                after,
                before
            };
            const result = notification_service_1.default.getNotifications(userId, query);
            // Récupérer le nombre total de notifications non lues
            const unreadCount = notification_service_1.default.countUnreadNotifications(userId);
            res.status(200).json({
                notifications: result.notifications,
                unreadCount,
                pagination: {
                    limit,
                    offset,
                    hasMore: result.notifications.length === limit,
                    total: result.total
                }
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des notifications:', error);
            res.status(500).json({ message: 'Erreur serveur lors de la récupération des notifications' });
        }
    }
    /**
     * Récupérer une notification par son ID
     * @route GET /api/notifications/:id
     */
    async getNotificationById(req, res) {
        try {
            const userId = req.user?.id;
            const notificationId = req.params.id;
            if (!userId) {
                res.status(401).json({ message: 'Utilisateur non authentifié' });
                return;
            }
            const notification = await notification_service_1.default.getNotificationById(notificationId);
            if (!notification) {
                res.status(404).json({ message: 'Notification non trouvée' });
                return;
            }
            // Vérifier que la notification appartient à l'utilisateur
            if (notification.userId !== userId) {
                res.status(403).json({ message: 'Accès non autorisé à cette notification' });
                return;
            }
            res.status(200).json(notification);
        }
        catch (error) {
            console.error('Erreur lors de la récupération de la notification:', error);
            res.status(500).json({ message: 'Erreur serveur lors de la récupération de la notification' });
        }
    }
    /**
     * Marquer une notification comme lue
     * @route PATCH /api/notifications/:id/read
     */
    async markAsRead(req, res) {
        try {
            const userId = req.user?.id;
            const notificationId = req.params.id;
            if (!userId) {
                res.status(401).json({ message: 'Utilisateur non authentifié' });
                return;
            }
            const notification = await notification_service_1.default.getNotificationById(notificationId);
            if (!notification) {
                res.status(404).json({ message: 'Notification non trouvée' });
                return;
            }
            // Vérifier que la notification appartient à l'utilisateur
            if (notification.userId !== userId) {
                res.status(403).json({ message: 'Accès non autorisé à cette notification' });
                return;
            }
            const updatedNotification = await notification_service_1.default.markAsRead(notificationId, userId);
            res.status(200).json(updatedNotification);
        }
        catch (error) {
            console.error('Erreur lors du marquage de la notification comme lue:', error);
            res.status(500).json({ message: 'Erreur serveur lors du marquage de la notification comme lue' });
        }
    }
    /**
     * Marquer toutes les notifications d'un utilisateur comme lues
     * @route PATCH /api/notifications/read-all
     */
    async markAllAsRead(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'Utilisateur non authentifié' });
                return;
            }
            const count = await notification_service_1.default.markAllAsRead(userId);
            res.status(200).json({
                message: `${count} notification(s) marquée(s) comme lue(s)`,
                count
            });
        }
        catch (error) {
            console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
            res.status(500).json({ message: 'Erreur serveur lors du marquage des notifications comme lues' });
        }
    }
    /**
     * Supprimer une notification
     * @route DELETE /api/notifications/:id
     */
    async deleteNotification(req, res) {
        try {
            const userId = req.user?.id;
            const notificationId = req.params.id;
            if (!userId) {
                res.status(401).json({ message: 'Utilisateur non authentifié' });
                return;
            }
            const notification = await notification_service_1.default.getNotificationById(notificationId);
            if (!notification) {
                res.status(404).json({ message: 'Notification non trouvée' });
                return;
            }
            // Vérifier que la notification appartient à l'utilisateur
            if (notification.userId !== userId) {
                res.status(403).json({ message: 'Accès non autorisé à cette notification' });
                return;
            }
            const deleted = notification_service_1.default.deleteNotification(notificationId, userId);
            if (deleted) {
                res.status(200).json({ message: 'Notification supprimée avec succès' });
            }
            else {
                res.status(404).json({ message: 'Notification non trouvée' });
            }
        }
        catch (error) {
            console.error('Erreur lors de la suppression de la notification:', error);
            res.status(500).json({ message: 'Erreur serveur lors de la suppression de la notification' });
        }
    }
    /**
     * Supprimer toutes les notifications d'un utilisateur
     * @route DELETE /api/notifications/all
     */
    async deleteAllNotifications(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'Utilisateur non authentifié' });
                return;
            }
            const count = notification_service_1.default.deleteAllNotifications(userId);
            res.status(200).json({
                message: `${count} notification(s) supprimée(s)`,
                count
            });
        }
        catch (error) {
            console.error('Erreur lors de la suppression de toutes les notifications:', error);
            res.status(500).json({ message: 'Erreur serveur lors de la suppression des notifications' });
        }
    }
    /**
     * Récupérer le nombre de notifications non lues
     * @route GET /api/notifications/unread-count
     */
    async getUnreadCount(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'Utilisateur non authentifié' });
                return;
            }
            const count = notification_service_1.default.countUnreadNotifications(userId);
            res.status(200).json({ count });
        }
        catch (error) {
            console.error('Erreur lors de la récupération du nombre de notifications non lues:', error);
            res.status(500).json({ message: 'Erreur serveur lors de la récupération du nombre de notifications non lues' });
        }
    }
    /**
     * Récupérer les préférences de notification d'un utilisateur
     * @route GET /api/notifications/preferences
     */
    async getUserPreferences(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'Utilisateur non authentifié' });
                return;
            }
            const preferences = await notification_service_1.default.getUserPreferences(userId);
            if (!preferences) {
                // Renvoyer les préférences par défaut si aucune n'est trouvée
                const defaultPreferences = {
                    userId,
                    commentNotifications: true,
                    assignmentNotifications: true,
                    documentUpdateNotifications: true,
                    dueDateNotifications: true,
                    systemNotifications: true,
                    emailNotifications: false,
                    pushNotifications: false
                };
                res.status(200).json(defaultPreferences);
                return;
            }
            res.status(200).json(preferences);
        }
        catch (error) {
            console.error('Erreur lors de la récupération des préférences de notification:', error);
            res.status(500).json({ message: 'Erreur serveur lors de la récupération des préférences de notification' });
        }
    }
    /**
     * Mettre à jour les préférences de notification d'un utilisateur
     * @route PATCH /api/notifications/preferences
     */
    async updateUserPreferences(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'Utilisateur non authentifié' });
                return;
            }
            const preferences = req.body;
            // Validation des champs booléens
            const booleanFields = [
                'commentNotifications',
                'assignmentNotifications',
                'documentUpdateNotifications',
                'dueDateNotifications',
                'systemNotifications',
                'emailNotifications',
                'pushNotifications'
            ];
            for (const field of booleanFields) {
                if (field in preferences && typeof preferences[field] !== 'boolean') {
                    res.status(400).json({
                        message: `Le champ ${field} doit être un booléen`,
                        field
                    });
                    return;
                }
            }
            const updatedPreferences = notification_service_1.default.updateUserPreferences(userId, preferences);
            res.status(200).json(updatedPreferences);
        }
        catch (error) {
            console.error('Erreur lors de la mise à jour des préférences de notification:', error);
            res.status(500).json({ message: 'Erreur serveur lors de la mise à jour des préférences de notification' });
        }
    }
    /**
     * Créer une notification de test pour l'utilisateur actuel
     * @route POST /api/notifications/test
     * Uniquement disponible en développement
     */
    async createTestNotification(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ message: 'Utilisateur non authentifié' });
                return;
            }
            // Vérifier l'environnement, mais autoriser les tests en développement local et test
            if (process.env.NODE_ENV === 'production') {
                console.log('Tentative d\'accès à l\'endpoint de test en production refusée');
                res.status(403).json({ message: 'Cette fonctionnalité est uniquement disponible en environnement de développement' });
                return;
            }
            console.log('Création de notification de test pour utilisateur:', userId);
            const { type = notification_model_1.NotificationType.SYSTEM, priority = notification_model_1.NotificationPriority.MEDIUM } = req.body;
            const notification = await notification_service_1.default.createNotification({
                userId,
                type,
                title: 'Notification de test',
                message: 'Ceci est une notification de test créée manuellement.',
                priority,
                link: '/notifications'
            });
            res.status(201).json(notification);
        }
        catch (error) {
            console.error('Erreur lors de la création de la notification de test:', error);
            res.status(500).json({ message: 'Erreur serveur lors de la création de la notification de test' });
        }
    }
    /**
     * Nettoyer les notifications expirées (tâche de maintenance)
     * @route DELETE /api/notifications/expired
     * Uniquement accessible aux administrateurs
     */
    async cleanupExpiredNotifications(req, res) {
        try {
            const user = req.user;
            if (!user) {
                res.status(401).json({ message: 'Utilisateur non authentifié' });
                return;
            }
            // Vérifier si l'utilisateur est administrateur
            if (user.role !== 'ADMIN') {
                res.status(403).json({ message: 'Accès non autorisé. Seuls les administrateurs peuvent effectuer cette opération.' });
                return;
            }
            // Implémentation temporaire pour supprimer les notifications expirées
            // Nous allons utiliser une requête personnalisée pour trouver et supprimer les notifications expirées
            const now = new Date().toISOString();
            let count = 0;
            // Logique de suppression des notifications expirées
            // Dans une implémentation réelle, cette logique serait dans le service de notification
            res.status(200).json({
                message: `${count} notification(s) expirée(s) supprimée(s)`,
                count
            });
        }
        catch (error) {
            console.error('Erreur lors du nettoyage des notifications expirées:', error);
            res.status(500).json({ message: 'Erreur serveur lors du nettoyage des notifications expirées' });
        }
    }
}
exports.default = new NotificationController();
