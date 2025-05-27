import express from 'express';
import { createTenant, getTenantInfo } from '../controllers/tenantController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @route   POST /api/tenants
 * @desc    Créer un nouveau tenant avec un utilisateur admin
 * @access  Public (inscription)
 */
router.post('/', createTenant);

/**
 * @route   GET /api/tenants/info
 * @desc    Récupérer les informations du tenant actuel
 * @access  Private
 */
router.get('/info', authMiddleware, getTenantInfo);

export default router;
