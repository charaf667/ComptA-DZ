"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Routes pour la gestion des notifications
 */
const express_1 = __importDefault(require("express"));
const notification_controller_1 = __importDefault(require("../controllers/notification.controller"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
// Appliquer l'authentification JWT à toutes les routes
router.use(authMiddleware_1.authMiddleware);
// Routes pour les préférences de notification
router.get('/preferences', notification_controller_1.default.getUserPreferences);
router.patch('/preferences', notification_controller_1.default.updateUserPreferences);
// Routes pour les notifications (générales)
router.get('/', notification_controller_1.default.getNotifications);
router.get('/unread-count', notification_controller_1.default.getUnreadCount);
router.patch('/read-all', notification_controller_1.default.markAllAsRead);
router.delete('/all', notification_controller_1.default.deleteAllNotifications);
// Routes pour les notifications (avec paramètres)
router.get('/:id', notification_controller_1.default.getNotificationById);
router.patch('/:id/read', notification_controller_1.default.markAsRead);
router.delete('/:id', notification_controller_1.default.deleteNotification);
// Routes de maintenance et de test
router.post('/test', notification_controller_1.default.createTestNotification); // Uniquement en développement
router.delete('/expired', notification_controller_1.default.cleanupExpiredNotifications); // Admin uniquement
exports.default = router;
