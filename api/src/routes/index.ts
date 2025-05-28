import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import tenantRoutes from './tenantRoutes';
import ocrRoutes from './ocr.routes';
import documentHistoryRoutes from './document-history.routes';
import documentVersionRoutes from './document-version.routes';
import documentCollaborationRoutes from './document-collaboration.routes';

const router = express.Router();

// Routes de l'application
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tenants', tenantRoutes);
router.use('/ocr', ocrRoutes);
router.use('/document-history', documentHistoryRoutes);
router.use('/document-versions', documentVersionRoutes);
router.use('/collaboration', documentCollaborationRoutes);

export default router;
