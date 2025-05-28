"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
/**
 * @route   GET /api/users/profile
 * @desc    Récupérer le profil de l'utilisateur connecté
 * @access  Private
 */
router.get('/profile', authMiddleware_1.authMiddleware, userController_1.getProfile);
/**
 * @route   GET /api/users
 * @desc    Récupérer tous les utilisateurs d'un tenant (admin seulement)
 * @access  Private/Admin
 */
router.get('/', authMiddleware_1.authMiddleware, userController_1.getUsersByTenant);
/**
 * @route   PUT /api/users/profile
 * @desc    Mettre à jour le profil de l'utilisateur connecté
 * @access  Private
 */
router.put('/profile', authMiddleware_1.authMiddleware, userController_1.updateProfile);
exports.default = router;
