// Déclaration globale pour les modules sans types
declare module 'pdf-parse';
declare module 'tesseract.js';

// Augmentation pour Express Request afin d'inclure req.user
import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      tenantId?: string | null;
      nom?: string; // Nom de l'utilisateur
      // Ajoutez d'autres propriétés de req.user si nécessaire (ex: role, email)
    };
  }
}

declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      tenantId?: string | null;
      nom?: string;
    };
  }
}

