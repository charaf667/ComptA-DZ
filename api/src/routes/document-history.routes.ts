import express from 'express';
import documentHistoryController from '../controllers/document-history.controller';

const router = express.Router();

// Routes pour l'historique des documents
router.post('/', documentHistoryController.addDocument);
router.get('/search', documentHistoryController.searchDocuments);
router.get('/statistics', documentHistoryController.getStatistics);
router.get('/:id', documentHistoryController.getDocument);
router.put('/:id', documentHistoryController.updateDocument);
router.delete('/:id', documentHistoryController.deleteDocument);
router.post('/:id/tags', documentHistoryController.addTag);
router.delete('/:id/tags/:tag', documentHistoryController.removeTag);

export default router;
