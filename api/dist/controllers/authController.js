"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
/**
 * Inscription d'un nouvel utilisateur
 */
const register = async (req, res) => {
    try {
        const { nom, email, password, tenantId, role } = req.body;
        // Vérifier si l'utilisateur existe déjà
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            res.status(400).json({ message: 'Cet email est déjà utilisé' });
            return;
        }
        // Hasher le mot de passe
        const salt = await bcrypt_1.default.genSalt(10);
        const hashedPassword = await bcrypt_1.default.hash(password, salt);
        // Créer l'utilisateur
        const user = await prisma_1.default.user.create({
            data: {
                nom,
                email,
                password: hashedPassword,
                tenant: { connect: { id: tenantId } },
                role,
            },
        });
        // Générer le token JWT
        const token = jsonwebtoken_1.default.sign({ user: { id: user.id, role: user.role }, tenant: tenantId }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1d' });
        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            token,
            user: {
                id: user.id,
                nom: user.nom,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('Erreur lors de l\'inscription:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
exports.register = register;
/**
 * Connexion d'un utilisateur existant
 */
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Vérifier si l'utilisateur existe
        const user = await prisma_1.default.user.findUnique({
            where: { email },
            include: { tenant: true },
        });
        if (!user) {
            res.status(400).json({ message: 'Email ou mot de passe incorrect' });
            return;
        }
        // Vérifier le mot de passe
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: 'Email ou mot de passe incorrect' });
            return;
        }
        // Générer le token JWT
        const token = jsonwebtoken_1.default.sign({ user: { id: user.id, role: user.role }, tenant: user.tenantId }, process.env.JWT_SECRET || 'default_secret', { expiresIn: '1d' });
        res.json({
            message: 'Connexion réussie',
            token,
            user: {
                id: user.id,
                nom: user.nom,
                email: user.email,
                role: user.role,
                tenant: {
                    id: user.tenant.id,
                    nom: user.tenant.nom,
                },
            },
        });
    }
    catch (error) {
        console.error('Erreur lors de la connexion:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};
exports.login = login;
