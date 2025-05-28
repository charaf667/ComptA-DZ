"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getUsersByTenant = exports.getProfile = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
/**
 * Récupérer le profil de l'utilisateur connecté
 */
const getProfile = async (req, res) => {
    try {
        const user = await prisma_1.default.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                nom: true,
                email: true,
                role: true,
                tenant: {
                    select: {
                        id: true,
                        nom: true
                    }
                }
            }
        });
        if (!user) {
            res.status(404).json({ message: 'Utilisateur non trouvé' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        console.error('Erreur lors de la récupération du profil:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
exports.getProfile = getProfile;
/**
 * Récupérer tous les utilisateurs d'un tenant (accessible uniquement par les admins)
 */
const getUsersByTenant = async (req, res) => {
    try {
        // Vérifier si l'utilisateur est admin
        if (req.user.role !== 'ADMIN') {
            res.status(403).json({ message: 'Accès non autorisé' });
            return;
        }
        const users = await prisma_1.default.user.findMany({
            where: { tenantId: req.tenant },
            select: {
                id: true,
                nom: true,
                email: true,
                role: true,
                createdAt: true
            }
        });
        res.json(users);
    }
    catch (error) {
        console.error('Erreur lors de la récupération des utilisateurs:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
exports.getUsersByTenant = getUsersByTenant;
/**
 * Mettre à jour le profil de l'utilisateur connecté
 */
const updateProfile = async (req, res) => {
    try {
        const { nom, email } = req.body;
        // Vérifier si l'email est déjà utilisé par un autre utilisateur
        if (email) {
            const existingUser = await prisma_1.default.user.findFirst({
                where: {
                    email,
                    id: { not: req.user.id }
                }
            });
            if (existingUser) {
                res.status(400).json({ message: 'Cet email est déjà utilisé' });
                return;
            }
        }
        const updatedUser = await prisma_1.default.user.update({
            where: { id: req.user.id },
            data: {
                nom: nom || undefined,
                email: email || undefined,
                modifiePar: req.user.id
            },
            select: {
                id: true,
                nom: true,
                email: true,
                role: true
            }
        });
        res.json({
            message: 'Profil mis à jour avec succès',
            user: updatedUser
        });
    }
    catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
exports.updateProfile = updateProfile;
