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
/**
 * Service de gestion des versions de documents
 * Permet de stocker, récupérer et comparer les différentes versions d'un document
 */
class DocumentVersionService {
    constructor() {
        // Chemin vers le fichier de stockage des versions
        this.dataFilePath = path.join(__dirname, '../../data/document-versions.json');
        this.ensureDataFileExists();
    }
    /**
     * S'assure que le fichier de données existe, sinon le crée
     */
    ensureDataFileExists() {
        const dataDir = path.dirname(this.dataFilePath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        if (!fs.existsSync(this.dataFilePath)) {
            fs.writeFileSync(this.dataFilePath, JSON.stringify({}));
        }
    }
    /**
     * Lit toutes les versions de documents depuis le fichier de données
     */
    readData() {
        try {
            const data = fs.readFileSync(this.dataFilePath, 'utf8');
            return JSON.parse(data);
        }
        catch (error) {
            console.error('Erreur lors de la lecture des versions de documents:', error);
            return {};
        }
    }
    /**
     * Écrit les données des versions dans le fichier
     */
    writeData(data) {
        try {
            fs.writeFileSync(this.dataFilePath, JSON.stringify(data, null, 2));
        }
        catch (error) {
            console.error('Erreur lors de l\'écriture des versions de documents:', error);
        }
    }
    /**
     * Crée une nouvelle version pour un document
     */
    async createVersion(versionData) {
        const data = this.readData();
        // Récupérer les versions existantes du document ou initialiser un tableau vide
        const documentVersions = data[versionData.documentId] || [];
        // Déterminer le numéro de version
        const versionNumber = documentVersions.length > 0
            ? documentVersions[documentVersions.length - 1].versionNumber + 1
            : 1;
        // Créer la nouvelle version
        const newVersion = {
            id: (0, uuid_1.v4)(),
            documentId: versionData.documentId,
            versionNumber,
            createdAt: new Date().toISOString(),
            createdBy: versionData.createdBy,
            comment: versionData.comment,
            changes: versionData.changes,
            snapshot: versionData.snapshot
        };
        // Ajouter la nouvelle version à la liste des versions du document
        documentVersions.push(newVersion);
        data[versionData.documentId] = documentVersions;
        // Sauvegarder les données
        this.writeData(data);
        return newVersion;
    }
    /**
     * Récupère les versions d'un document spécifique
     */
    async getVersions(options) {
        const data = this.readData();
        // Vérifier si le document existe
        if (!data[options.documentId]) {
            return [];
        }
        let versions = [...data[options.documentId]];
        // Trier les versions
        versions.sort((a, b) => {
            return options.sortDirection === 'asc'
                ? a.versionNumber - b.versionNumber
                : b.versionNumber - a.versionNumber;
        });
        // Appliquer la pagination si spécifiée
        if (options.limit !== undefined && options.offset !== undefined) {
            versions = versions.slice(options.offset, options.offset + options.limit);
        }
        return versions;
    }
    /**
     * Récupère une version spécifique d'un document
     */
    async getVersion(documentId, versionNumber) {
        const data = this.readData();
        if (!data[documentId]) {
            return null;
        }
        const version = data[documentId].find(v => v.versionNumber === versionNumber);
        return version || null;
    }
    /**
     * Récupère la dernière version d'un document
     */
    async getLatestVersion(documentId) {
        const data = this.readData();
        if (!data[documentId] || data[documentId].length === 0) {
            return null;
        }
        // Trier les versions par numéro de version décroissant
        const sortedVersions = [...data[documentId]].sort((a, b) => b.versionNumber - a.versionNumber);
        return sortedVersions[0];
    }
    /**
     * Compare deux versions d'un document et retourne les différences
     */
    async compareVersions(documentId, fromVersion, toVersion) {
        const data = this.readData();
        if (!data[documentId]) {
            return null;
        }
        const fromVersionData = data[documentId].find(v => v.versionNumber === fromVersion);
        const toVersionData = data[documentId].find(v => v.versionNumber === toVersion);
        if (!fromVersionData || !toVersionData) {
            return null;
        }
        // Récupérer toutes les modifications entre les deux versions
        const allVersions = data[documentId]
            .filter(v => v.versionNumber > fromVersion && v.versionNumber <= toVersion)
            .sort((a, b) => a.versionNumber - b.versionNumber);
        // Agréger les changements de toutes les versions intermédiaires
        const changes = allVersions.flatMap(v => v.changes);
        return {
            fromVersion,
            toVersion,
            documentId,
            changes,
            createdAt: toVersionData.createdAt,
            createdBy: toVersionData.createdBy
        };
    }
    /**
     * Restaure une version précédente d'un document
     * Crée une nouvelle version basée sur le snapshot d'une version antérieure
     */
    async restoreVersion(documentId, versionNumber, restoredBy, comment = `Restauration de la version ${versionNumber}`) {
        const versionToRestore = await this.getVersion(documentId, versionNumber);
        if (!versionToRestore) {
            return null;
        }
        const latestVersion = await this.getLatestVersion(documentId);
        if (!latestVersion) {
            return null;
        }
        // Créer une nouvelle version basée sur la version restaurée
        const newVersion = {
            documentId,
            comment,
            // Les changements consistent en la différence entre la dernière version et la version restaurée
            changes: [
                {
                    field: '_restoration',
                    previousValue: { versionNumber: latestVersion.versionNumber },
                    newValue: { versionNumber: versionToRestore.versionNumber },
                    timestamp: new Date().toISOString()
                }
            ],
            snapshot: versionToRestore.snapshot,
            createdBy: restoredBy
        };
        return this.createVersion(newVersion);
    }
    /**
     * Supprime toutes les versions d'un document
     * Utilisé lorsqu'un document est définitivement supprimé
     */
    async deleteAllVersions(documentId) {
        const data = this.readData();
        if (!data[documentId]) {
            return false;
        }
        delete data[documentId];
        this.writeData(data);
        return true;
    }
}
exports.default = new DocumentVersionService();
