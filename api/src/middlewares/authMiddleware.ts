import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Interface pour étendre Request avec les propriétés user et tenant
export interface AuthRequest extends Request {
  user?: any;
  tenant?: string;
  headers: Request['headers'];
}

/**
 * Middleware d'authentification qui vérifie et décode le JWT
 * Extrait les informations utilisateur et tenant
 */
export const authMiddleware = async (
  req: AuthRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Accès non autorisé' });
      return;
    }
    
    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    
    req.user = decoded.user;
    req.tenant = decoded.tenant;
    
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    res.status(401).json({ message: 'Token invalide' });
    return;
  }
};
