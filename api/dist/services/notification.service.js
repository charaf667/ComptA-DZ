"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Service de gestion des notifications
 */
const uuid_1 = require("uuid");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const websocket_service_1 = __importDefault(require("./websocket.service"));
const notification_model_1 = require("../models/notification.model");
// Chemin vers le fichier JSON pour stocker les notifications
const NOTIFICATIONS_FILE = path_1.default.join(__dirname, '..', '..', 'data', 'notifications.json');
const NOTIFICATION_PREFERENCES_FILE = path_1.default.join(__dirname, '..', '..', 'data', 'notification-preferences.json');
// S'assurer que le répertoire data existe
const dataDir = path_1.default.join(__dirname, '..', '..', 'data');
if (!fs_1.default.existsSync(dataDir)) {
    fs_1.default.mkdirSync(dataDir, { recursive: true });
}
// Initialiser les fichiers s'ils n'existent pas
if (!fs_1.default.existsSync(NOTIFICATIONS_FILE)) {
    fs_1.default.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify([], null, 2));
}
if (!fs_1.default.existsSync(NOTIFICATION_PREFERENCES_FILE)) {
    fs_1.default.writeFileSync(NOTIFICATION_PREFERENCES_FILE, JSON.stringify([], null, 2));
}
class NotificationService {
    constructor() {
        this.notifications = [];
        this.preferences = [];
        this.loadNotifications();
        this.loadPreferences();
    }
    /**
     * Charger les notifications depuis le fichier JSON
     */
    loadNotifications() {
        try {
            const data = fs_1.default.readFileSync(NOTIFICATIONS_FILE, 'utf8');
            this.notifications = JSON.parse(data);
        }
        catch (error) {
            console.error('Erreur lors du chargement des notifications:', error);
            this.notifications = [];
        }
    }
    /**
     * Sauvegarder les notifications dans le fichier JSON
     */
    saveNotifications() {
        try {
            fs_1.default.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(this.notifications, null, 2));
        }
        catch (error) {
            console.error('Erreur lors de la sauvegarde des notifications:', error);
        }
    }
    /**
     * Charger les préférences de notification depuis le fichier JSON
     */
    loadPreferences() {
        try {
            const data = fs_1.default.readFileSync(NOTIFICATION_PREFERENCES_FILE, 'utf8');
            this.preferences = JSON.parse(data);
        }
        catch (error) {
            console.error('Erreur lors du chargement des préférences de notification:', error);
            this.preferences = [];
        }
    }
    /**
     * Sauvegarder les préférences de notification dans le fichier JSON
     */
    savePreferences() {
        try {
            fs_1.default.writeFileSync(NOTIFICATION_PREFERENCES_FILE, JSON.stringify(this.preferences, null, 2));
        }
        catch (error) {
            console.error('Erreur lors de la sauvegarde des préférences de notification:', error);
        }
    }
    /**
     * Créer une nouvelle notification
     * @param notificationData Données de la notification à créer
     * @returns La notification créée ou undefined si les préférences de l'utilisateur empêchent sa création
     */
    async createNotification(notificationData) {
        // Vérifier si l'utilisateur a activé ce type de notification
        const userPreferences = await this.getUserPreferences(notificationData.userId);
        // Si les préférences existent, vérifier si ce type de notification est activé
        if (userPreferences) {
            switch (notificationData.type) {
                case notification_model_1.NotificationType.COMMENT:
                case notification_model_1.NotificationType.COMMENT_RESOLVED:
                    if (!userPreferences.commentNotifications)
                        return undefined;
                    break;
                case notification_model_1.NotificationType.ASSIGNMENT:
                case notification_model_1.NotificationType.ASSIGNMENT_STATUS:
                    if (!userPreferences.assignmentNotifications)
                        return undefined;
                    break;
                case notification_model_1.NotificationType.DOCUMENT_UPDATED:
                    if (!userPreferences.documentUpdateNotifications)
                        return undefined;
                    break;
                case notification_model_1.NotificationType.DUE_DATE:
                    if (!userPreferences.dueDateNotifications)
                        return undefined;
                    break;
                case notification_model_1.NotificationType.SYSTEM:
                    if (!userPreferences.systemNotifications)
                        return undefined;
                    break;
            }
        }
        const notification = {
            id: (0, uuid_1.v4)(),
            userId: notificationData.userId,
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
            isRead: false,
            createdAt: new Date().toISOString(),
            priority: notificationData.priority || notification_model_1.NotificationPriority.MEDIUM,
            ...notificationData.referenceId && { referenceId: notificationData.referenceId },
            ...notificationData.referenceType && { referenceType: notificationData.referenceType },
            ...notificationData.link && { link: notificationData.link },
            ...notificationData.expiresAt && { expiresAt: notificationData.expiresAt }
        };
        this.notifications.push(notification);
        this.saveNotifications();
        // Envoyer la notification via WebSocket
        websocket_service_1.default.sendNotification(notification.userId, notification);
        return notification;
    }
    /**
     * Obtenir toutes les notifications d'un utilisateur
     * @param userId ID de l'utilisateur
     * @param query Options de requête (filtres, pagination)
     * @returns Liste des notifications
     */
    getNotifications(userId, query = {}) {
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
            }
            else {
                filteredNotifications = filteredNotifications.filter(n => n.type === query.type);
            }
        }
        // Filtrer par date
        if (query.after) {
            filteredNotifications = filteredNotifications.filter(n => new Date(n.createdAt) >= new Date(query.after));
        }
        if (query.before) {
            filteredNotifications = filteredNotifications.filter(n => new Date(n.createdAt) <= new Date(query.before));
        }
        // Trier par date (plus récent d'abord)
        filteredNotifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
    getNotificationById(notificationId) {
        return this.notifications.find(n => n.id === notificationId);
    }
    /**
     * Mettre à jour une notification
     * @param notificationId ID de la notification
     * @param updateData Données à mettre à jour
     * @returns La notification mise à jour ou undefined si non trouvée
     */
    updateNotification(notificationId, updateData) {
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
    markAsRead(notificationId, userId) {
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
    markAllAsRead(userId) {
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
    deleteNotification(notificationId, userId) {
        const initialLength = this.notifications.length;
        this.notifications = this.notifications.filter(n => !(n.id === notificationId && n.userId === userId));
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
    deleteAllNotifications(userId) {
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
    getUserPreferences(userId) {
        return this.preferences.find(p => p.userId === userId);
    }
    /**
     * Créer ou mettre à jour les préférences de notification d'un utilisateur
     * @param userId ID de l'utilisateur
     * @param preferences Préférences de notification
     * @returns Préférences de notification mises à jour
     */
    updateUserPreferences(userId, preferencesData) {
        const existingPreferencesIndex = this.preferences.findIndex(p => p.userId === userId);
        // Valeurs par défaut pour les nouvelles préférences
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
        let updatedPreferences;
        if (existingPreferencesIndex === -1) {
            // Créer de nouvelles préférences
            updatedPreferences = {
                ...defaultPreferences,
                ...preferencesData
            };
            this.preferences.push(updatedPreferences);
        }
        else {
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
    async createCommentNotification(documentId, commentId, commentContent, createdBy, assignedTo) {
        return this.createNotification({
            userId: assignedTo,
            type: notification_model_1.NotificationType.COMMENT,
            title: 'Nouveau commentaire',
            message: `${createdBy} a commenté un document : "${commentContent.substring(0, 50)}${commentContent.length > 50 ? '...' : ''}"`,
            referenceId: commentId,
            referenceType: 'comment',
            priority: notification_model_1.NotificationPriority.MEDIUM,
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
    async createCommentResolvedNotification(documentId, commentId, resolvedBy, commentAuthor) {
        return this.createNotification({
            userId: commentAuthor,
            type: notification_model_1.NotificationType.COMMENT_RESOLVED,
            title: 'Commentaire résolu',
            message: `${resolvedBy} a marqué votre commentaire comme résolu.`,
            referenceId: commentId,
            referenceType: 'comment',
            priority: notification_model_1.NotificationPriority.LOW,
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
    async createAssignmentNotification(documentId, assignmentId, assignedBy, assignedTo, dueDate, priority) {
        let message = `${assignedBy} vous a assigné un document.`;
        if (dueDate) {
            const dueDateObj = new Date(dueDate);
            message += ` Échéance: ${dueDateObj.toLocaleDateString()}.`;
        }
        return this.createNotification({
            userId: assignedTo,
            type: notification_model_1.NotificationType.ASSIGNMENT,
            title: 'Nouvelle assignation',
            message,
            referenceId: assignmentId,
            referenceType: 'assignment',
            priority: priority || notification_model_1.NotificationPriority.MEDIUM,
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
    async createDueDateNotification(documentId, assignmentId, assignedTo, dueDate, priority) {
        const dueDateObj = new Date(dueDate);
        const formattedDate = dueDateObj.toLocaleDateString();
        return this.createNotification({
            userId: assignedTo,
            type: notification_model_1.NotificationType.DUE_DATE,
            title: 'Échéance approchante',
            message: `Une assignation approche de sa date d'échéance (${formattedDate}).`,
            referenceId: assignmentId,
            referenceType: 'assignment',
            priority: priority || notification_model_1.NotificationPriority.HIGH,
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
    async createSystemNotification(userId, title, message, priority = notification_model_1.NotificationPriority.MEDIUM, link) {
        return this.createNotification({
            userId,
            type: notification_model_1.NotificationType.SYSTEM,
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
    async createSystemNotifications(userIds, title, message, priority = notification_model_1.NotificationPriority.MEDIUM, link) {
        const notifications = [];
        for (const userId of userIds) {
            const notification = await this.createNotification({
                userId,
                type: notification_model_1.NotificationType.SYSTEM,
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
    countUnreadNotifications(userId) {
        return this.notifications.filter(n => n.userId === userId && !n.isRead).length;
    }
}
// Exporter une instance du service
const notificationService = new NotificationService();
exports.default = notificationService;
