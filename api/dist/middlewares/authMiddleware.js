"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Middleware d'authentification qui vérifie et décode le JWT
 * Extrait les informations utilisateur et tenant
 */
const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Accès non autorisé' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default_secret');
        req.user = decoded.user;
        req.tenant = decoded.tenant;
        next();
    }
    catch (error) {
        console.error('Erreur d\'authentification:', error);
        res.status(401).json({ message: 'Token invalide' });
        return;
    }
};
exports.authMiddleware = authMiddleware;
