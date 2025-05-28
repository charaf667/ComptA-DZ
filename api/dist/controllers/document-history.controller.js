"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentHistoryController = void 0;
const document_history_service_1 = __importDefault(require("../services/document-history.service"));
class DocumentHistoryController {
    /**
     * Ajoute un document à l'historique
     * @param req Requête HTTP contenant les données du document
     * @param res Réponse HTTP
     */
    async addDocument(req, res) {
        try {
            const { filename, extractedData, selectedAccount } = req.body;
            if (!filename || !extractedData) {
                res.status(400).json({
                    success: false,
                    message: 'Données manquantes: filename et extractedData sont requis'
                });
                return;
            }
            const document = document_history_service_1.default.addDocument(filename, extractedData, selectedAccount);
            res.status(201).json({
                success: true,
                message: 'Document ajouté à l\'historique avec succès',
                data: document
            });
        }
        catch (error) {
            console.error('Erreur lors de l\'ajout du document à l\'historique:', error);
            res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de l\'ajout du document à l\'historique',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * Récupère un document par son identifiant
     * @param req Requête HTTP contenant l'identifiant du document
     * @param res Réponse HTTP
     */
    async getDocument(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Identifiant du document requis'
                });
                return;
            }
            const document = document_history_service_1.default.getDocumentById(id);
            if (!document) {
                res.status(404).json({
                    success: false,
                    message: `Document avec l'identifiant ${id} non trouvé`
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: document
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération du document:', error);
            res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de la récupération du document',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * Met à jour un document existant
     * @param req Requête HTTP contenant l'identifiant et les mises à jour du document
     * @param res Réponse HTTP
     */
    async updateDocument(req, res) {
        try {
            const { id } = req.params;
            const updates = req.body;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Identifiant du document requis'
                });
                return;
            }
            if (!updates || Object.keys(updates).length === 0) {
                res.status(400).json({
                    success: false,
                    message: 'Aucune mise à jour fournie'
                });
                return;
            }
            const updatedDocument = document_history_service_1.default.updateDocument(id, updates);
            if (!updatedDocument) {
                res.status(404).json({
                    success: false,
                    message: `Document avec l'identifiant ${id} non trouvé`
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Document mis à jour avec succès',
                data: updatedDocument
            });
        }
        catch (error) {
            console.error('Erreur lors de la mise à jour du document:', error);
            res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de la mise à jour du document',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * Supprime un document de l'historique
     * @param req Requête HTTP contenant l'identifiant du document
     * @param res Réponse HTTP
     */
    async deleteDocument(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Identifiant du document requis'
                });
                return;
            }
            const deleted = document_history_service_1.default.deleteDocument(id);
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: `Document avec l'identifiant ${id} non trouvé`
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Document supprimé avec succès'
            });
        }
        catch (error) {
            console.error('Erreur lors de la suppression du document:', error);
            res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de la suppression du document',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * Recherche des documents selon les critères spécifiés
     * @param req Requête HTTP contenant les critères de recherche
     * @param res Réponse HTTP
     */
    async searchDocuments(req, res) {
        try {
            const filterOptions = req.query;
            // Conversion des valeurs numériques
            if (filterOptions.montantMin) {
                filterOptions.montantMin = parseFloat(filterOptions.montantMin);
            }
            if (filterOptions.montantMax) {
                filterOptions.montantMax = parseFloat(filterOptions.montantMax);
            }
            if (filterOptions.limit) {
                filterOptions.limit = parseInt(filterOptions.limit);
            }
            if (filterOptions.offset) {
                filterOptions.offset = parseInt(filterOptions.offset);
            }
            // Conversion des booléens
            if (filterOptions.isEdited !== undefined) {
                // Conversion explicite en booléen
                const isEditedValue = String(filterOptions.isEdited).toLowerCase();
                filterOptions.isEdited = isEditedValue === 'true';
            }
            // Conversion des tableaux
            if (typeof filterOptions.tags === 'string') {
                filterOptions.tags = [filterOptions.tags];
            }
            const documents = document_history_service_1.default.searchDocuments(filterOptions);
            res.status(200).json({
                success: true,
                count: documents.length,
                data: documents
            });
        }
        catch (error) {
            console.error('Erreur lors de la recherche de documents:', error);
            res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de la recherche de documents',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * Récupère les statistiques sur les documents traités
     * @param req Requête HTTP
     * @param res Réponse HTTP
     */
    async getStatistics(req, res) {
        try {
            const statistics = document_history_service_1.default.getStatistics();
            res.status(200).json({
                success: true,
                data: statistics
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de la récupération des statistiques',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * Ajoute un tag à un document
     * @param req Requête HTTP contenant l'identifiant du document et le tag
     * @param res Réponse HTTP
     */
    async addTag(req, res) {
        try {
            const { id } = req.params;
            const { tag } = req.body;
            if (!id || !tag) {
                res.status(400).json({
                    success: false,
                    message: 'Identifiant du document et tag requis'
                });
                return;
            }
            const updatedDocument = document_history_service_1.default.addTag(id, tag);
            if (!updatedDocument) {
                res.status(404).json({
                    success: false,
                    message: `Document avec l'identifiant ${id} non trouvé`
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Tag ajouté avec succès',
                data: updatedDocument
            });
        }
        catch (error) {
            console.error('Erreur lors de l\'ajout du tag:', error);
            res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de l\'ajout du tag',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * Supprime un tag d'un document
     * @param req Requête HTTP contenant l'identifiant du document et le tag
     * @param res Réponse HTTP
     */
    async removeTag(req, res) {
        try {
            const { id, tag } = req.params;
            if (!id || !tag) {
                res.status(400).json({
                    success: false,
                    message: 'Identifiant du document et tag requis'
                });
                return;
            }
            const updatedDocument = document_history_service_1.default.removeTag(id, tag);
            if (!updatedDocument) {
                res.status(404).json({
                    success: false,
                    message: `Document avec l'identifiant ${id} non trouvé ou tag inexistant`
                });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Tag supprimé avec succès',
                data: updatedDocument
            });
        }
        catch (error) {
            console.error('Erreur lors de la suppression du tag:', error);
            res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de la suppression du tag',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
}
exports.DocumentHistoryController = DocumentHistoryController;
exports.default = new DocumentHistoryController();
