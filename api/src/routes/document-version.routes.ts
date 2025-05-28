import { Router } from 'express';
import documentVersionController from '../controllers/document-version.controller';

/**
 * Router pour les routes liées aux versions de documents
 */
const router = Router();

// Créer une nouvelle version de document
router.post('/', documentVersionController.createVersion);

// Récupérer les versions d'un document
router.get('/:documentId', documentVersionController.getVersions);

// Récupérer la dernière version d'un document
router.get('/:documentId/latest', documentVersionController.getLatestVersion);

// Récupérer une version spécifique d'un document
router.get('/:documentId/:versionNumber', documentVersionController.getVersion);

// Comparer deux versions d'un document
router.get(
  '/:documentId/compare/:fromVersion/:toVersion',
  documentVersionController.compareVersions
);

// Restaurer une version précédente d'un document
router.post(
  '/:documentId/restore/:versionNumber',
  documentVersionController.restoreVersion
);

// Supprimer toutes les versions d'un document
router.delete('/:documentId', documentVersionController.deleteAllVersions);

export default router;
