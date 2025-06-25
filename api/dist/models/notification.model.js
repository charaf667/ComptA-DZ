"use strict";
/**
 * Modèle pour les notifications système
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationPriority = exports.NotificationType = void 0;
// Types de notifications
var NotificationType;
(function (NotificationType) {
    NotificationType["COMMENT"] = "COMMENT";
    NotificationType["COMMENT_RESOLVED"] = "COMMENT_RESOLVED";
    NotificationType["ASSIGNMENT"] = "ASSIGNMENT";
    NotificationType["ASSIGNMENT_STATUS"] = "ASSIGNMENT_STATUS";
    NotificationType["DOCUMENT_UPDATED"] = "DOCUMENT_UPDATED";
    NotificationType["DUE_DATE"] = "DUE_DATE";
    NotificationType["SYSTEM"] = "SYSTEM"; // Notification système générale
})(NotificationType || (exports.NotificationType = NotificationType = {}));
// Niveau de priorité des notifications
var NotificationPriority;
(function (NotificationPriority) {
    NotificationPriority["LOW"] = "LOW";
    NotificationPriority["MEDIUM"] = "MEDIUM";
    NotificationPriority["HIGH"] = "HIGH";
})(NotificationPriority || (exports.NotificationPriority = NotificationPriority = {}));
