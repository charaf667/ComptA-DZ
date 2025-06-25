import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import adaptiveLearningService from '../services/adaptive-learning.service';

/**
 * Endpoint POST /api/suggest-accounts
 * Suggère des comptes à partir des données extraites
 */
export async function suggestAccountsController(req: AuthRequest, res: Response) {
  try {
    const data = req.body;
    const tenantId = req.tenant?.id;
    
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ success: false, message: 'Données invalides' });
    }
    
    if (!tenantId) {
      return res.status(403).json({ success: false, message: 'Accès refusé: identifiant du tenant manquant' });
    }
    
    const suggestions = await adaptiveLearningService.suggestAccounts(tenantId, data);
    res.json({ success: true, data: suggestions });
  } catch (error) {
    console.error('Erreur lors de la suggestion de comptes:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error instanceof Error ? error.message : String(error) });
  }
}

/**
 * Endpoint POST /api/feedback
 * Enregistre le feedback utilisateur sur la suggestion
 */
export async function recordFeedbackController(req: AuthRequest, res: Response) {
  try {
    const { data, selectedAccount } = req.body;
    const tenantId = req.tenant?.id;
    
    if (!data || !selectedAccount) {
      return res.status(400).json({ success: false, message: 'Données ou compte sélectionné manquants' });
    }
    
    if (!tenantId) {
      return res.status(403).json({ success: false, message: 'Accès refusé: identifiant du tenant manquant' });
    }
    
    await adaptiveLearningService.recordFeedback(tenantId, data, selectedAccount);
    res.json({ success: true, message: 'Feedback enregistré' });
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du feedback:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur', error: error instanceof Error ? error.message : String(error) });
  }
}

