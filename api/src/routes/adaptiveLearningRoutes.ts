import { Router, Request, Response, NextFunction } from 'express';
import authMiddleware from '../middlewares/authMiddleware';
import { suggestAccountsController, recordFeedbackController } from '../controllers/adaptive-learning.controller';

const router = Router();

// Endpoint pour suggérer des comptes
router.post('/suggest-accounts', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await suggestAccountsController(req, res);
  } catch (error) {
    next(error);
  }
});

// Endpoint pour enregistrer le feedback utilisateur
router.post('/feedback', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await recordFeedbackController(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
