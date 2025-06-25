import { Router, Request, Response } from 'express';
import authMiddleware, { AuthRequest } from '../middlewares/authMiddleware';
import { AdaptiveLearningService } from '../services/adaptive-learning.service';

const router = Router();
// Note: AdaptiveLearningService est instancié ici. 
// Si c'était un service géré par un conteneur d'injection de dépendances (comme avec NestJS),
// on l'obtiendrait différemment. Pour une app Express simple, une nouvelle instance est courante.
const adaptiveLearningService = new AdaptiveLearningService();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const metrics = await adaptiveLearningService.getPerformanceMetrics(req.tenant?.id || '');
    // Le frontend s'attend à une réponse de la forme { success: true, data: metrics }
    res.json({ success: true, data: metrics });
  } catch (error) {
    const err = error as Error;
    console.error('Erreur lors de la récupération des métriques de performance:', err.message);
    res.status(500).json({ success: false, message: 'Erreur interne du serveur', error: err.message });
  }
});

export default router;
