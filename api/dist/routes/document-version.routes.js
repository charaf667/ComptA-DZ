"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const document_version_controller_1 = __importDefault(require("../controllers/document-version.controller"));
/**
 * Router pour les routes liées aux versions de documents
 */
const router = (0, express_1.Router)();
// Créer une nouvelle version de document
router.post('/', document_version_controller_1.default.createVersion);
// Récupérer les versions d'un document
router.get('/:documentId', document_version_controller_1.default.getVersions);
// Récupérer la dernière version d'un document
router.get('/:documentId/latest', document_version_controller_1.default.getLatestVersion);
// Récupérer une version spécifique d'un document
router.get('/:documentId/:versionNumber', document_version_controller_1.default.getVersion);
// Comparer deux versions d'un document
router.get('/:documentId/compare/:fromVersion/:toVersion', document_version_controller_1.default.compareVersions);
// Restaurer une version précédente d'un document
router.post('/:documentId/restore/:versionNumber', document_version_controller_1.default.restoreVersion);
// Supprimer toutes les versions d'un document
router.delete('/:documentId', document_version_controller_1.default.deleteAllVersions);
exports.default = router;
