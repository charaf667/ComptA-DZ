"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const uuid_1 = require("uuid");
const document_collaboration_model_1 = require("../models/document-collaboration.model");
const event_service_1 = __importStar(require("./event.service"));
/**
 * Service de gestion des fonctionnalités de collaboration
 * Permet de gérer les commentaires et les assignations sur les documents
 */
class DocumentCollaborationService {
    constructor() {
        // Chemins vers les fichiers de stockage
        this.commentsFilePath = path.join(__dirname, '../../data/document-comments.json');
        this.assignmentsFilePath = path.join(__dirname, '../../data/document-assignments.json');
        this.ensureDataFilesExist();
    }
    /**
     * S'assure que les fichiers de données existent, sinon les crée
     */
    ensureDataFilesExist() {
        const dataDir = path.dirname(this.commentsFilePath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        if (!fs.existsSync(this.commentsFilePath)) {
            fs.writeFileSync(this.commentsFilePath, JSON.stringify({}));
        }
        if (!fs.existsSync(this.assignmentsFilePath)) {
            fs.writeFileSync(this.assignmentsFilePath, JSON.stringify({}));
        }
    }
    /**
     * Lit les commentaires depuis le fichier de données
     */
    readComments() {
        try {
            const data = fs.readFileSync(this.commentsFilePath, 'utf8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error('Erreur lors de la lecture des commentaires:', error);
            return {};
        }
    }
    /**
     * Écrit les commentaires dans le fichier
     */
    writeComments(data) {
        try {
            fs.writeFileSync(this.commentsFilePath, JSON.stringify(data, null, 2));
        }
        catch (error) {
            console.error('Erreur lors de l\'écriture des commentaires:', error);
        }
    }
    /**
     * Lit les assignations depuis le fichier de données
     */
    readAssignments() {
        try {
            const data = fs.readFileSync(this.assignmentsFilePath, 'utf8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error('Erreur lors de la lecture des assignations:', error);
            return {};
        }
    }
    /**
     * Écrit les assignations dans le fichier
     */
    writeAssignments(data) {
        try {
            fs.writeFileSync(this.assignmentsFilePath, JSON.stringify(data, null, 2));
        }
        catch (error) {
            console.error('Erreur lors de l\'écriture des assignations:', error);
        }
    }
    /**
     * Crée un nouveau commentaire sur un document
     */
    async createComment(commentData) {
        const data = this.readComments();
        // Récupérer les commentaires existants du document ou initialiser un tableau vide
        const documentComments = data[commentData.documentId] || [];
        // Créer le nouveau commentaire
        const newComment = {
            id: (0, uuid_1.v4)(),
            documentId: commentData.documentId,
            createdAt: new Date().toISOString(),
            createdBy: commentData.createdBy,
            content: commentData.content,
            isResolved: false
        };
        // Ajouter l'ID du commentaire parent si c'est une réponse
        if (commentData.parentId) {
            newComment.parentId = commentData.parentId;
        }
        // Ajouter le nouveau commentaire à la liste des commentaires du document
        documentComments.push(newComment);
        data[commentData.documentId] = documentComments;
        // Sauvegarder les données
        this.writeComments(data);
        // Émettre un événement pour notifier les utilisateurs concernés
        event_service_1.default.emit(event_service_1.EventType.COMMENT_CREATED, {
            documentId: newComment.documentId,
            commentId: newComment.id,
            content: newComment.content,
            createdBy: newComment.createdBy,
            documentOwner: commentData.documentOwner || ''
        });
        return newComment;
    }
    /**
     * Récupère les commentaires d'un document spécifique
     */
    async getComments(options) {
        const data = this.readComments();
        // Vérifier si le document existe
        if (!data[options.documentId]) {
            return [];
        }
        let comments = [...data[options.documentId]];
        // Filtrer par commentaire parent
        if (options.parentId !== undefined) {
            comments = comments.filter(c => c.parentId === options.parentId);
        }
        // Filtrer par statut de résolution
        if (options.includeResolved === false) {
            comments = comments.filter(c => !c.isResolved);
        }
        // Trier les commentaires
        comments.sort((a, b) => {
            return options.sortDirection === 'asc'
                ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        // Appliquer la pagination si spécifiée
        if (options.limit !== undefined && options.offset !== undefined) {
            comments = comments.slice(options.offset, options.offset + options.limit);
        }
        return comments;
    }
    /**
     * Met à jour un commentaire existant
     */
    async updateComment(commentId, updateData, updatedBy) {
        const data = this.readComments();
        let updatedComment = null;
        // Parcourir tous les documents pour trouver le commentaire
        for (const documentId in data) {
            const commentIndex = data[documentId].findIndex(c => c.id === commentId);
            if (commentIndex !== -1) {
                // Mettre à jour le commentaire
                const comment = data[documentId][commentIndex];
                updatedComment = {
                    ...comment,
                    updatedAt: new Date().toISOString()
                };
                if (updateData.content !== undefined) {
                    updatedComment.content = updateData.content;
                }
                if (updateData.isResolved !== undefined) {
                    updatedComment.isResolved = updateData.isResolved;
                    // Si le commentaire est marqué comme résolu, émettre un événement
                    if (updateData.isResolved && updatedBy) {
                        event_service_1.default.emit(event_service_1.EventType.COMMENT_RESOLVED, {
                            documentId,
                            commentId,
                            resolvedBy: updatedBy,
                            commentAuthor: comment.createdBy
                        });
                    }
                }
                data[documentId][commentIndex] = updatedComment;
                this.writeComments(data);
                break;
            }
        }
        return updatedComment;
    }
    /**
     * Supprime un commentaire
     */
    async deleteComment(commentId) {
        const data = this.readComments();
        let deleted = false;
        // Parcourir tous les documents pour trouver le commentaire
        for (const documentId in data) {
            const commentIndex = data[documentId].findIndex(c => c.id === commentId);
            if (commentIndex !== -1) {
                // Supprimer le commentaire
                data[documentId].splice(commentIndex, 1);
                this.writeComments(data);
                deleted = true;
                break;
            }
        }
        return deleted;
    }
    /**
     * Crée une nouvelle assignation de document
     */
    async createAssignment(assignmentData) {
        const data = this.readAssignments();
        // Récupérer les assignations existantes du document ou initialiser un tableau vide
        const documentAssignments = data[assignmentData.documentId] || [];
        // Vérifier si l'utilisateur est déjà assigné à ce document
        const existingAssignment = documentAssignments.find(a => a.assignedTo === assignmentData.assignedTo &&
            a.status !== document_collaboration_model_1.AssignmentStatus.COMPLETED &&
            a.status !== document_collaboration_model_1.AssignmentStatus.CANCELLED);
        if (existingAssignment) {
            throw new Error('Cet utilisateur est déjà assigné à ce document');
        }
        // Créer la nouvelle assignation
        const newAssignment = {
            id: (0, uuid_1.v4)(),
            documentId: assignmentData.documentId,
            assignedTo: assignmentData.assignedTo,
            assignedBy: assignmentData.assignedBy,
            assignedAt: new Date().toISOString(),
            status: document_collaboration_model_1.AssignmentStatus.PENDING,
            priority: assignmentData.priority
        };
        // Ajouter des champs optionnels s'ils sont fournis
        if (assignmentData.dueDate) {
            newAssignment.dueDate = assignmentData.dueDate;
        }
        if (assignmentData.description) {
            newAssignment.description = assignmentData.description;
        }
        // Ajouter la nouvelle assignation à la liste des assignations du document
        documentAssignments.push(newAssignment);
        data[assignmentData.documentId] = documentAssignments;
        // Sauvegarder les données
        this.writeAssignments(data);
        // Émettre un événement pour notifier l'utilisateur assigné
        event_service_1.default.emit(event_service_1.EventType.ASSIGNMENT_CREATED, {
            documentId: newAssignment.documentId,
            assignmentId: newAssignment.id,
            assignedBy: newAssignment.assignedBy,
            assignedTo: newAssignment.assignedTo,
            dueDate: newAssignment.dueDate,
            priority: newAssignment.priority
        });
        return newAssignment;
    }
    /**
     * Récupère les assignations selon les critères spécifiés
     */
    async getAssignments(options) {
        const data = this.readAssignments();
        let assignments = [];
        // Si un documentId est spécifié, récupérer seulement les assignations de ce document
        if (options.documentId) {
            assignments = data[options.documentId] || [];
        }
        else {
            // Sinon, récupérer toutes les assignations
            assignments = Object.values(data).flat();
        }
        // Filtrer par utilisateur assigné
        if (options.assignedTo) {
            assignments = assignments.filter(a => a.assignedTo === options.assignedTo);
        }
        // Filtrer par statut
        if (options.status && options.status.length > 0) {
            assignments = assignments.filter(a => options.status?.includes(a.status));
        }
        // Trier les assignations
        assignments.sort((a, b) => {
            return options.sortDirection === 'asc'
                ? new Date(a.assignedAt).getTime() - new Date(b.assignedAt).getTime()
                : new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime();
        });
        // Appliquer la pagination si spécifiée
        if (options.limit !== undefined && options.offset !== undefined) {
            assignments = assignments.slice(options.offset, options.offset + options.limit);
        }
        return assignments;
    }
    /**
     * Met à jour une assignation existante
     */
    async updateAssignment(assignmentId, updateData, updatedBy) {
        const data = this.readAssignments();
        let updatedAssignment = null;
        // Parcourir tous les documents pour trouver l'assignation
        for (const documentId in data) {
            const assignmentIndex = data[documentId].findIndex(a => a.id === assignmentId);
            if (assignmentIndex !== -1) {
                // Mettre à jour l'assignation
                const assignment = data[documentId][assignmentIndex];
                updatedAssignment = {
                    ...assignment
                };
                // Mettre à jour le statut si spécifié
                if (updateData.status !== undefined) {
                    const oldStatus = updatedAssignment.status;
                    updatedAssignment.status = updateData.status;
                    // Si le statut passe à complété, enregistrer la date d'achèvement
                    if (updateData.status === document_collaboration_model_1.AssignmentStatus.COMPLETED && !updatedAssignment.completedAt) {
                        updatedAssignment.completedAt = new Date().toISOString();
                    }
                    // Émettre un événement pour notifier du changement de statut
                    if (updatedBy && oldStatus !== updateData.status) {
                        event_service_1.default.emit(event_service_1.EventType.ASSIGNMENT_STATUS_CHANGED, {
                            documentId,
                            assignmentId,
                            updatedBy,
                            assignedTo: assignment.assignedTo,
                            status: updateData.status
                        });
                    }
                }
                // Mettre à jour les autres champs si spécifiés
                if (updateData.dueDate !== undefined) {
                    updatedAssignment.dueDate = updateData.dueDate;
                }
                if (updateData.description !== undefined) {
                    updatedAssignment.description = updateData.description;
                }
                if (updateData.priority !== undefined) {
                    updatedAssignment.priority = updateData.priority;
                }
                data[documentId][assignmentIndex] = updatedAssignment;
                this.writeAssignments(data);
                break;
            }
        }
        return updatedAssignment;
    }
    /**
     * Supprime une assignation
     */
    async deleteAssignment(assignmentId) {
        const data = this.readAssignments();
        let deleted = false;
        // Parcourir tous les documents pour trouver l'assignation
        for (const documentId in data) {
            const assignmentIndex = data[documentId].findIndex(a => a.id === assignmentId);
            if (assignmentIndex !== -1) {
                // Supprimer l'assignation
                data[documentId].splice(assignmentIndex, 1);
                this.writeAssignments(data);
                deleted = true;
                break;
            }
        }
        return deleted;
    }
    /**
     * Supprime toutes les assignations et commentaires d'un document
     * Utilisé lorsqu'un document est définitivement supprimé
     */
    async deleteAllCollaborationData(documentId) {
        // Supprimer les commentaires
        const commentsData = this.readComments();
        if (commentsData[documentId]) {
            delete commentsData[documentId];
            this.writeComments(commentsData);
        }
        // Supprimer les assignations
        const assignmentsData = this.readAssignments();
        if (assignmentsData[documentId]) {
            delete assignmentsData[documentId];
            this.writeAssignments(assignmentsData);
        }
        return true;
    }
    /**
     * Récupère toutes les assignations pour un document spécifique
     * @param documentId ID du document
     * @returns Liste des assignations pour ce document
     */
    async getAssignmentsByDocumentId(documentId) {
        const data = this.readAssignments();
        return data[documentId] || [];
    }
    /**
     * Récupère toutes les assignations ayant une date d'échéance
     * @returns Liste des assignations avec date d'échéance
     */
    async getAllAssignmentsWithDueDate() {
        const data = this.readAssignments();
        const allAssignments = Object.values(data).flat();
        // Filtrer pour ne garder que les assignations avec une date d'échéance
        return allAssignments.filter(assignment => {
            return (assignment.dueDate &&
                assignment.status !== document_collaboration_model_1.AssignmentStatus.COMPLETED &&
                assignment.status !== document_collaboration_model_1.AssignmentStatus.CANCELLED);
        });
    }
}
exports.default = new DocumentCollaborationService();
