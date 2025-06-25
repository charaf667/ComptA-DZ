/**
 * Routes pour la gestion des notifications
 */
import express from 'express';
import notificationController from '../controllers/notification.controller';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

// Appliquer l'authentification JWT à toutes les routes
router.use(authMiddleware);

// Routes pour les préférences de notification
router.get('/preferences', notificationController.getUserPreferences);
router.patch('/preferences', notificationController.updateUserPreferences);

// Routes pour les notifications (générales)
router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.patch('/read-all', notificationController.markAllAsRead);
router.delete('/all', notificationController.deleteAllNotifications);

// Routes pour les notifications (avec paramètres)
router.get('/:id', notificationController.getNotificationById);
router.patch('/:id/read', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);

// Routes de maintenance et de test
router.post('/test', notificationController.createTestNotification); // Uniquement en développement
router.delete('/expired', notificationController.cleanupExpiredNotifications); // Admin uniquement

export default router;
