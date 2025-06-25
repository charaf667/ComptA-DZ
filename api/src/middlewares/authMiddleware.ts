import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interface pour étendre Request avec les propriétés user et tenant
export interface AuthRequest extends Request {
  user?: any; // TODO: Définir un type plus précis
  tenant?: any;
  headers: Request['headers'];
}

/**
 * Vérifie et décode un token JWT
 * @param token Token JWT à vérifier
 * @returns Payload décodé ou null en cas d'erreur
 */
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
  } catch (error) {
    console.error('Erreur de vérification du token JWT:', error);
    return null;
  }
}

/**
 * Middleware d'authentification qui vérifie et décode le JWT
 * Extrait les informations utilisateur et tenant
 */
export default function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Accès non autorisé' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    
    // Mode développement - Accepter le token fictif pour faciliter les tests
    /* // Désactivé pour permettre l'utilisation de l'authentification réelle en dev
    if (process.env.NODE_ENV !== 'production') {
      try {
        // Rechercher le premier tenant disponible dans la base de données
        const prisma = require('../config/prisma').default;
        const tenant = await prisma.tenant.findFirst();
        
        if (tenant) {
          console.log(`Mode développement: Utilisation d'un utilisateur de test avec tenant ${tenant.id}`);
          req.user = {
            id: '123',
            email: 'test@example.com',
            nom: 'Utilisateur Test',
            role: 'ADMIN',
            tenantId: tenant.id
          };
          req.tenant = tenant.id;
        } else {
          console.warn('Aucun tenant trouvé dans la base de données. Utilisez le script d\'initialisation.');
          res.status(401).json({ 
            message: 'Aucun tenant disponible. Veuillez initialiser la base de données.',
            hint: 'Exécutez: node src/scripts/run-init-db.js --with-accounts'
          });
          return;
        }
      } catch (err) {
        console.error('Erreur lors de la récupération du tenant:', err);
        res.status(500).json({ message: 'Erreur serveur lors de l\'authentification' });
        return;
      }
      next();
      return;
    }
    */
    
    // Vérification normale du token JWT
    const decoded = verifyToken(token);
    
    if (!decoded) {
      res.status(401).json({ message: 'Token invalide' });
      return;
    }
    
    req.user = decoded.user;
    // Normaliser tenant : toujours un objet { id: string }
    if (decoded.tenant) {
      req.tenant = typeof decoded.tenant === 'string'
        ? { id: decoded.tenant }
        : decoded.tenant;
    }
    
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.warn(`[AUTH] Token expired for request: ${req.method} ${req.originalUrl}`);
      res.status(401).json({
        success: false,
        message: 'Session expirée. Veuillez vous reconnecter.',
        error: 'TokenExpiredError'
      });
      return next();
    }
    console.error(`[AUTH] Unauthorized access: ${(error as Error).message}`, { method: req.method, url: req.originalUrl });
    res.status(401).json({
      success: false,
      message: 'Accès non autorisé'
    });
    next();
  }
};
