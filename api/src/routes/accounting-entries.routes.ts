import express from 'express';
import { AccountingEntriesController } from '../controllers/accounting-entries.controller';
import authMiddleware from '../middlewares/authMiddleware';
import { requireRoles } from '../middlewares/roleMiddleware';
import { tenantIsolation } from '../middlewares/tenantIsolationMiddleware';

const router = express.Router();
const controller = new AccountingEntriesController();

// Route pour générer une écriture comptable
router.post('/generate', authMiddleware, tenantIsolation(), requireRoles('ACCOUNTANT','ADMIN'), controller.generateEntry);

// Route pour récupérer toutes les écritures comptables
router.get('/', authMiddleware, tenantIsolation(), requireRoles('ACCOUNTANT','ADMIN'), controller.getAllEntries);

// Route pour récupérer les écritures comptables liées à un document
router.get('/document/:documentId', authMiddleware, tenantIsolation(), requireRoles('ACCOUNTANT','ADMIN'), controller.getEntriesByDocumentId);

export default router;
