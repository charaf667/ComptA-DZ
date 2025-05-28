"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTenantInfo = exports.createTenant = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
/**
 * Créer un nouveau tenant avec un utilisateur admin
 */
const createTenant = async (req, res) => {
    try {
        const { nomTenant, nomAdmin, emailAdmin, passwordAdmin } = req.body;
        // Vérifier si l'email est déjà utilisé
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: emailAdmin },
        });
        if (existingUser) {
            res.status(400).json({ message: 'Cet email est déjà utilisé' });
            return;
        }
        // Hasher le mot de passe
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(passwordAdmin, salt);
        // Créer le tenant et l'utilisateur admin dans une transaction
        const result = await prisma_1.default.$transaction(async (tx) => {
            // Créer le tenant
            const tenant = await tx.tenant.create({
                data: {
                    nom: nomTenant
                }
            });
            // Créer l'utilisateur admin
            const admin = await tx.user.create({
                data: {
                    nom: nomAdmin,
                    email: emailAdmin,
                    password: hashedPassword,
                    role: 'ADMIN',
                    tenant: { connect: { id: tenant.id } }
                }
            });
            return { tenant, admin };
        });
        res.status(201).json({
            message: 'Entreprise créée avec succès',
            tenant: {
                id: result.tenant.id,
                nom: result.tenant.nom
            },
            admin: {
                id: result.admin.id,
                nom: result.admin.nom,
                email: result.admin.email
            }
        });
    }
    catch (error) {
        console.error('Erreur lors de la création du tenant:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
exports.createTenant = createTenant;
/**
 * Récupérer les informations du tenant actuel
 */
const getTenantInfo = async (req, res) => {
    try {
        const tenant = await prisma_1.default.tenant.findUnique({
            where: { id: req.tenant },
            select: {
                id: true,
                nom: true,
                createdAt: true,
                _count: {
                    select: {
                        users: true,
                        factures: true
                    }
                }
            }
        });
        if (!tenant) {
            res.status(404).json({ message: 'Tenant non trouvé' });
            return;
        }
        res.json(tenant);
    }
    catch (error) {
        console.error('Erreur lors de la récupération du tenant:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
exports.getTenantInfo = getTenantInfo;
