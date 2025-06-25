"use strict";
/**
 * Modèles pour les fonctionnalités de collaboration sur les documents
 * Comprend les commentaires et les assignations
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentStatus = void 0;
/**
 * Statut d'une assignation
 */
var AssignmentStatus;
(function (AssignmentStatus) {
    AssignmentStatus["PENDING"] = "pending";
    AssignmentStatus["IN_PROGRESS"] = "in_progress";
    AssignmentStatus["COMPLETED"] = "completed";
    AssignmentStatus["CANCELLED"] = "cancelled";
})(AssignmentStatus || (exports.AssignmentStatus = AssignmentStatus = {}));
