import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper pour gérer les fonctions asynchrones dans Express
 * Permet d'utiliser des fonctions async/await sans try/catch explicite dans chaque route
 * 
 * @param fn Fonction asynchrone à exécuter
 * @returns Fonction middleware compatible avec Express
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
