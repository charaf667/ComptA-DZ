// Augmentation standard pour Express Request avec req.user
import * as express from 'express';

declare global {
  namespace Express {
    // Augmentation de l'interface Request
    interface Request {
      user?: {
        id: string;
        tenantId?: string | null;
        nom?: string;
        // Ajoutez d'autres propriétés si nécessaire
      };
    }
  }
}

// Cette ligne est nécessaire pour que ce fichier soit traité comme un module
export {};
