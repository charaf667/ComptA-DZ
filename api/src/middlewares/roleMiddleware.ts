import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

export type Role = 'ADMIN' | 'ACCOUNTANT' | 'USER';

/**
 * Middleware factory permettant de restreindre l'accès à certaines routes en fonction du rôle utilisateur.
 * Utilisation :
 *   router.get('/admin-only', requireRoles('ADMIN'), controllerFn)
 */
import { RequestHandler } from 'express';

export function requireRoles(...allowedRoles: Role[]): RequestHandler {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userRole = req.user?.role as Role | undefined;

    if (!userRole) {
      res.status(401).json({ message: 'Utilisateur non authentifié' });
      return;
    }

    if (!allowedRoles.includes(userRole)) {
      res.status(403).json({ message: 'Accès interdit: rôle insuffisant' });
      return;
    }

    next();
  };
}
