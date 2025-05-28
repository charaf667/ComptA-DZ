"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const document_version_service_1 = __importDefault(require("../services/document-version.service"));
/**
 * Contrôleur pour la gestion des versions de documents
 * Expose les endpoints API pour manipuler les versions
 */
class DocumentVersionController {
    /**
     * Crée une nouvelle version de document
     * POST /api/document-versions
     */
    async createVersion(req, res) {
        try {
            const versionData = req.body;
            if (!versionData.documentId) {
                res.status(400).json({ error: 'ID du document manquant' });
                return;
            }
            const newVersion = await document_version_service_1.default.createVersion(versionData);
            res.status(201).json(newVersion);
        }
        catch (error) {
            console.error('Erreur lors de la création d\'une version:', error);
            res.status(500).json({ error: 'Erreur lors de la création de la version' });
        }
    }
    /**
     * Récupère les versions d'un document
     * GET /api/document-versions/:documentId
     */
    async getVersions(req, res) {
        try {
            const { documentId } = req.params;
            const { limit, offset, sortDirection } = req.query;
            const options = {
                documentId,
                limit: limit ? parseInt(limit, 10) : undefined,
                offset: offset ? parseInt(offset, 10) : undefined,
                sortDirection: sortDirection === 'asc' ? 'asc' : 'desc'
            };
            const versions = await document_version_service_1.default.getVersions(options);
            res.json(versions);
        }
        catch (error) {
            console.error('Erreur lors de la récupération des versions:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération des versions' });
        }
    }
    /**
     * Récupère une version spécifique d'un document
     * GET /api/document-versions/:documentId/:versionNumber
     */
    async getVersion(req, res) {
        try {
            const { documentId, versionNumber } = req.params;
            const version = await document_version_service_1.default.getVersion(documentId, parseInt(versionNumber, 10));
            if (!version) {
                res.status(404).json({ error: 'Version non trouvée' });
                return;
            }
            res.json(version);
        }
        catch (error) {
            console.error('Erreur lors de la récupération d\'une version:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération de la version' });
        }
    }
    /**
     * Récupère la dernière version d'un document
     * GET /api/document-versions/:documentId/latest
     */
    async getLatestVersion(req, res) {
        try {
            const { documentId } = req.params;
            const version = await document_version_service_1.default.getLatestVersion(documentId);
            if (!version) {
                res.status(404).json({ error: 'Aucune version trouvée pour ce document' });
                return;
            }
            res.json(version);
        }
        catch (error) {
            console.error('Erreur lors de la récupération de la dernière version:', error);
            res.status(500).json({ error: 'Erreur lors de la récupération de la dernière version' });
        }
    }
    /**
     * Compare deux versions d'un document
     * GET /api/document-versions/:documentId/compare/:fromVersion/:toVersion
     */
    async compareVersions(req, res) {
        try {
            const { documentId, fromVersion, toVersion } = req.params;
            const diff = await document_version_service_1.default.compareVersions(documentId, parseInt(fromVersion, 10), parseInt(toVersion, 10));
            if (!diff) {
                res.status(404).json({ error: 'Impossible de comparer les versions' });
                return;
            }
            res.json(diff);
        }
        catch (error) {
            console.error('Erreur lors de la comparaison des versions:', error);
            res.status(500).json({ error: 'Erreur lors de la comparaison des versions' });
        }
    }
    /**
     * Restaure une version précédente d'un document
     * POST /api/document-versions/:documentId/restore/:versionNumber
     */
    async restoreVersion(req, res) {
        try {
            const { documentId, versionNumber } = req.params;
            const { restoredBy, comment } = req.body;
            if (!restoredBy) {
                res.status(400).json({ error: 'Utilisateur restaurant la version non spécifié' });
                return;
            }
            const restoredVersion = await document_version_service_1.default.restoreVersion(documentId, parseInt(versionNumber, 10), restoredBy, comment);
            if (!restoredVersion) {
                res.status(404).json({ error: 'Impossible de restaurer la version' });
                return;
            }
            res.status(201).json(restoredVersion);
        }
        catch (error) {
            console.error('Erreur lors de la restauration d\'une version:', error);
            res.status(500).json({ error: 'Erreur lors de la restauration de la version' });
        }
    }
    /**
     * Supprime toutes les versions d'un document
     * DELETE /api/document-versions/:documentId
     */
    async deleteAllVersions(req, res) {
        try {
            const { documentId } = req.params;
            const success = await document_version_service_1.default.deleteAllVersions(documentId);
            if (!success) {
                res.status(404).json({ error: 'Document non trouvé' });
                return;
            }
            res.status(204).send();
        }
        catch (error) {
            console.error('Erreur lors de la suppression des versions:', error);
            res.status(500).json({ error: 'Erreur lors de la suppression des versions' });
        }
    }
}
exports.default = new DocumentVersionController();
