import express from 'express';
import { AccountingEntriesController } from '../controllers/accounting-entries.controller';

const router = express.Router();
const controller = new AccountingEntriesController();

// Route pour générer une écriture comptable
router.post('/generate', controller.generateEntry);

// Route pour récupérer toutes les écritures comptables
router.get('/', controller.getAllEntries);

// Route pour récupérer les écritures comptables liées à un document
router.get('/document/:documentId', controller.getEntriesByDocumentId);

export default router;
