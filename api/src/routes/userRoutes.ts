import express from 'express';
import { getProfile, getUsersByTenant, updateProfile } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Récupérer le profil de l'utilisateur connecté
 * @access  Private
 */
router.get('/profile', authMiddleware, getProfile);

/**
 * @route   GET /api/users
 * @desc    Récupérer tous les utilisateurs d'un tenant (admin seulement)
 * @access  Private/Admin
 */
router.get('/', authMiddleware, getUsersByTenant);

/**
 * @route   PUT /api/users/profile
 * @desc    Mettre à jour le profil de l'utilisateur connecté
 * @access  Private
 */
router.put('/profile', authMiddleware, updateProfile);

export default router;
