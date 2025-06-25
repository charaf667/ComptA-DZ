import express from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import tenantRoutes from './tenantRoutes';
import ocrRoutes from './ocr.routes';
import documentHistoryRoutes from './document-history.routes';
import documentVersionRoutes from './document-version.routes';
import documentCollaborationRoutes from './document-collaboration.routes';
import notificationRoutes from './notification.routes';
import adaptiveLearningRoutes from './adaptiveLearningRoutes';
import accountRoutes from './account.routes';
import performanceRoutes from './performanceRoutes';

const router = express.Router();

// Routes de l'application
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tenants', tenantRoutes);
router.use('/ocr', ocrRoutes);
router.use('/document-history', documentHistoryRoutes);
router.use('/document-versions', documentVersionRoutes);
router.use('/collaboration', documentCollaborationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/adaptive-learning', adaptiveLearningRoutes);
router.use('/accounts', accountRoutes);
router.use('/performance-metrics', performanceRoutes);

export default router;
