"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tenantController_1 = require("../controllers/tenantController");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = express_1.default.Router();
/**
 * @route   POST /api/tenants
 * @desc    Créer un nouveau tenant avec un utilisateur admin
 * @access  Public (inscription)
 */
router.post('/', tenantController_1.createTenant);
/**
 * @route   GET /api/tenants/info
 * @desc    Récupérer les informations du tenant actuel
 * @access  Private
 */
router.get('/info', authMiddleware_1.authMiddleware, tenantController_1.getTenantInfo);
exports.default = router;
