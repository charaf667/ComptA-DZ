"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const document_collaboration_service_1 = __importDefault(require("../services/document-collaboration.service"));
/**
 * Contrôleur pour gérer les fonctionnalités de collaboration sur les documents
 * Inclut la gestion des commentaires et des assignations
 */
class DocumentCollaborationController {
    /**
     * Crée un nouveau commentaire
     */
    async createComment(req, res) {
        try {
            const commentData = req.body;
            if (!commentData.documentId || !commentData.createdBy || !commentData.content) {
                return res.status(400).json({ error: 'Données incomplètes pour créer un commentaire' });
            }
            const newComment = await document_collaboration_service_1.default.createComment(commentData);
            res.status(201).json(newComment);
        }
        catch (error) {
            console.error('Erreur lors de la création d\'un commentaire:', error);
            res.status(500).json({ error: 'Erreur lors de la création du commentaire' });
        }
    }
    /**
     * Récupère les commentaires d'un document
     */
    async getComments(req, res) {
        try {
            const { documentId, parentId, includeResolved, sortDirection, limit, offset } = req.query;
            if (!documentId) {
                return res.status(400).json({ error: 'ID du document requis' });
            }
            const options = {
                documentId: documentId,
                parentId: parentId,
                includeResolved: includeResolved === 'true',
                sortDirection: sortDirection || 'desc',
                limit: limit ? parseInt(limit, 10) : undefined,
                offset: offset ? parseInt(offset, 10) : undefined
            };
            const comments = await document_collaboration_service_1.default.getComments(options);
            res.json(comments);
        }
        catch (error) {
            console.error('Erreur lors de la récupération des commentaires:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
        }
    }
    /**
     * Met à jour un commentaire existant
     */
    async updateComment(req, res) {
        try {
            const { commentId } = req.params;
            const updateData = req.body;
            if (!commentId) {
                return res.status(400).json({ error: 'ID du commentaire requis' });
            }
            const updatedComment = await document_collaboration_service_1.default.updateComment(commentId, updateData);
            if (!updatedComment) {
                return res.status(404).json({ error: 'Commentaire non trouvé' });
            }
            res.json(updatedComment);
        }
        catch (error) {
            console.error('Erreur lors de la mise à jour du commentaire:', error);
            res.status(500).json({ error: 'Erreur lors de la mise à jour du commentaire' });
        }
    }
    /**
     * Supprime un commentaire
     */
    async deleteComment(req, res) {
        try {
            const { commentId } = req.params;
            if (!commentId) {
                return res.status(400).json({ error: 'ID du commentaire requis' });
            }
            const deleted = await document_collaboration_service_1.default.deleteComment(commentId);
            if (!deleted) {
                return res.status(404).json({ error: 'Commentaire non trouvé' });
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Erreur lors de la suppression du commentaire:', error);
            res.status(500).json({ error: 'Erreur lors de la suppression du commentaire' });
        }
    }
    /**
     * Crée une nouvelle assignation
     */
    async createAssignment(req, res) {
        try {
            const assignmentData = req.body;
            if (!assignmentData.documentId || !assignmentData.assignedTo || !assignmentData.assignedBy) {
                return res.status(400).json({ error: 'Données incomplètes pour créer une assignation' });
            }
            const newAssignment = await document_collaboration_service_1.default.createAssignment(assignmentData);
            res.status(201).json(newAssignment);
        }
        catch (error) {
            console.error('Erreur lors de la création d\'une assignation:', error);
            res.status(500).json({ error: 'Erreur lors de la création de l\'assignation' });
        }
    }
    /**
     * Récupère les assignations selon les critères spécifiés
     */
    async getAssignments(req, res) {
        try {
            const { documentId, assignedTo, status, sortDirection, limit, offset } = req.query;
            // Convertir le statut en tableau si nécessaire
            let statusArray;
            if (status) {
                if (Array.isArray(status)) {
                    statusArray = status;
                }
                else {
                    statusArray = [status];
                }
            }
            const options = {
                documentId: documentId,
                assignedTo: assignedTo,
                status: statusArray,
                sortDirection: sortDirection || 'desc',
                limit: limit ? parseInt(limit, 10) : undefined,
                offset: offset ? parseInt(offset, 10) : undefined
            };
            const assignments = await document_collaboration_service_1.default.getAssignments(options);
            res.json(assignments);
        }
        catch (error) {
            console.error('Erreur lors de la récupération des assignations:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des assignations' });
        }
    }
    /**
     * Met à jour une assignation existante
     */
    async updateAssignment(req, res) {
        try {
            const { assignmentId } = req.params;
            const updateData = req.body;
            if (!assignmentId) {
                return res.status(400).json({ error: 'ID de l\'assignation requis' });
            }
            const updatedAssignment = await document_collaboration_service_1.default.updateAssignment(assignmentId, updateData);
            if (!updatedAssignment) {
                return res.status(404).json({ error: 'Assignation non trouvée' });
            }
            res.json(updatedAssignment);
        }
        catch (error) {
            console.error('Erreur lors de la mise à jour de l\'assignation:', error);
            res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'assignation' });
        }
    }
    /**
     * Supprime une assignation
     */
    async deleteAssignment(req, res) {
        try {
            const { assignmentId } = req.params;
            if (!assignmentId) {
                return res.status(400).json({ error: 'ID de l\'assignation requis' });
            }
            const deleted = await document_collaboration_service_1.default.deleteAssignment(assignmentId);
            if (!deleted) {
                return res.status(404).json({ error: 'Assignation non trouvée' });
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Erreur lors de la suppression de l\'assignation:', error);
            res.status(500).json({ error: 'Erreur lors de la suppression de l\'assignation' });
        }
    }
    /**
     * Supprime toutes les données de collaboration d'un document
     */
    async deleteAllCollaborationData(req, res) {
        try {
            const { documentId } = req.params;
            if (!documentId) {
                return res.status(400).json({ error: 'ID du document requis' });
            }
            await document_collaboration_service_1.default.deleteAllCollaborationData(documentId);
            res.status(204).send();
        }
        catch (error) {
            console.error('Erreur lors de la suppression des données de collaboration:', error);
            res.status(500).json({ error: 'Erreur lors de la suppression des données de collaboration' });
        }
    }
}
exports.default = new DocumentCollaborationController();
