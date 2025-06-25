import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/authMiddleware';
import eventService, { EventType } from '../services/event.service';
import * as path from 'path';
import * as fs from 'fs-extra';
import ocrService, { ExtractedData } from '../services/ocr.service';
import aiClassificationService, { AccountSuggestion } from '../services/ai-classification.service';
import adaptiveLearningService from '../services/adaptive-learning.service';

export class OcrController {
  /**
   * Traite un fichier uploadé pour en extraire les données
   * @param req Requête HTTP
   * @param res Réponse HTTP
   */
  public async processFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'Aucun fichier n\'a été téléchargé' });
        return;
      }

      const filePath = req.file.path;
      const fileExt = path.extname(filePath).toLowerCase();
      const supportedFormats = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.bmp'];

      if (!supportedFormats.includes(fileExt)) {
        await fs.remove(filePath);
        res.status(400).json({
          success: false,
          message: `Format de fichier non supporté. Formats acceptés: ${supportedFormats.join(', ')}`
        });
        return;
      }

      // Extraction des données du fichier
      const extractedData = await ocrService.extractDataFromFile(filePath);

      res.status(200).json({
        success: true,
        data: extractedData
      });
    } catch (error) {
      console.error('Erreur lors du traitement du fichier:', error);
      res.status(500).json({
        success: false,
        message: 'Une erreur est survenue lors du traitement du fichier',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Classifie un document et suggère des comptes comptables
   */
  public async classifyDocument(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { extractedData } = req.body;
      const tenantId = req.tenant?.id;

      if (!extractedData) {
        res.status(400).json({ success: false, message: 'Données extraites manquantes' });
        return;
      }

      if (!tenantId) {
        res.status(400).json({ success: false, message: 'Identifiant du tenant manquant' });
        return;
      }

      const classificationResult = await aiClassificationService.classifyDocument(extractedData, tenantId);

      // Enrichir extractedData avec la meilleure suggestion initiale
      if (classificationResult.suggestions && classificationResult.suggestions.length > 0) {
        extractedData.initialAISuggestion = classificationResult.suggestions[0];
      }

      res.status(200).json({
        success: true,
        extractedData, // Retourner extractedData enrichi
        classification: classificationResult
      });
    } catch (error) {
      console.error('Erreur lors de la classification du document:', error);
      res.status(500).json({
        success: false,
        message: 'Une erreur est survenue lors de la classification du document',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Process et classifie un fichier en une seule étape
   * @param req Requête HTTP
   * @param res Réponse HTTP
   */
  public async processAndClassify(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'Aucun fichier n\'a été téléchargé' });
        return;
      }

      const filePath = req.file.path;
      const fileExt = path.extname(filePath).toLowerCase();
      const supportedFormats = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.bmp'];

      if (!supportedFormats.includes(fileExt)) {
        await fs.remove(filePath);
        res.status(400).json({
          success: false,
          message: `Format de fichier non supporté. Formats acceptés: ${supportedFormats.join(', ')}`
        });
        return;
      }

      // Vérification spécifique pour les PDF
      if (fileExt === '.pdf') {
        try {
          // Vérification de la taille du fichier
          const stats = await fs.stat(filePath);
          if (stats.size === 0) {
            await fs.remove(filePath);
            res.status(400).json({
              success: false,
              message: 'Le fichier PDF est vide'
            });
            return;
          }

          // Vérifier si c'est un PDF généré par ChatGPT (basé sur le flag du frontend)
          const isChatGptPdf = req.body && req.body.isChatGptPdf === 'true';
          
          if (isChatGptPdf) {
            console.log('PDF généré par ChatGPT détecté, utilisation du mode de compatibilité');
          }
          
          // Tenter de lire les premières pages pour vérifier la validité du PDF
          // Cette étape peut détecter les erreurs de structure PDF comme "bad XRef entry"
          try {
            await ocrService.validatePdf(filePath, isChatGptPdf);
          } catch (pdfError: any) {
            await fs.remove(filePath);
            // Erreur spécifique pour les PDF corrompus
            if (pdfError.message && (pdfError.message.includes('XRef') || pdfError.message.includes('corrupt'))) {
              res.status(400).json({
                success: false,
                message: 'Le fichier PDF est corrompu ou mal formaté',
                details: pdfError.message
              });
              return;
            }
            throw pdfError; // Propager d'autres erreurs PDF
          }
        } catch (validationError: any) {
          console.error('Erreur lors de la validation du PDF:', validationError);
          res.status(500).json({
            success: false,
            message: 'Erreur lors de la validation du fichier PDF',
            details: validationError.message
          });
          return;
        }
      }

      // Extraction des données du fichier
      const extractedData = await ocrService.extractDataFromFile(filePath);

      // Récupération du tenantId
      const tenantId = (req as AuthRequest).tenant?.id;
      
      if (!tenantId) {
        res.status(400).json({ success: false, message: 'Identifiant du tenant manquant' });
        return;
      }
      
      // Classification des données extraites
      const classificationResult = await aiClassificationService.classifyDocument(extractedData, tenantId);

      // Enrichir extractedData avec la meilleure suggestion initiale
      if (classificationResult.suggestions && classificationResult.suggestions.length > 0) {
        extractedData.initialAISuggestion = classificationResult.suggestions[0];
      }

      res.status(200).json({
        success: true,
        extractedData, // extractedData est maintenant enrichi
        classification: classificationResult
      });
    } catch (error: any) {
      console.error('Erreur lors du traitement et de la classification du fichier:', error);
      
      // Gestion spécifique des erreurs PDF
      if (error.message && error.message.includes('bad XRef entry')) {
        res.status(400).json({
          success: false,
          message: 'Le fichier PDF est corrompu ou mal formaté (bad XRef entry)',
          details: 'Le PDF contient une table de références croisées (XRef) invalide. Veuillez vérifier le fichier ou essayer un autre document.'
        });
        return;
      }
      
      // Gestion générique des erreurs
      res.status(500).json({
        success: false,
        message: 'Une erreur est survenue lors du traitement et de la classification du fichier',
        error: error.message || String(error),
        errorType: error.name || 'Unknown Error'
      });
    }
  }

  /**
   * Enregistre le feedback de l'utilisateur pour améliorer les suggestions futures
   * @param req Requête HTTP contenant les données extraites et le compte sélectionné
   * @param res Réponse HTTP
   */
  public async recordFeedback(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { extractedData, selectedAccount, feedbackData } = req.body;
      const tenantId = req.tenant?.id;
      
      // Validation des données entrantes
      if (!extractedData || !selectedAccount) {
        res.status(400).json({
          success: false,
          message: 'Données manquantes: extractedData et selectedAccount sont requis'
        });
        return;
      }
      
      // Validation du tenantId
      if (!tenantId) {
        res.status(403).json({
          success: false,
          message: 'Accès refusé: identifiant du tenant manquant'
        });
        return;
      }
      
      // Enregistrement du feedback via le service AI Classification
      aiClassificationService.recordUserFeedback(extractedData, selectedAccount, tenantId, feedbackData);
      
      // Émission d'un événement pour la notification
      try {
        if (req.user?.id) {
          const userName = req.user.name || 'Utilisateur';
          const docId = extractedData.documentId || 'inconnu';
          const docName = extractedData.fileName || 'Document inconnu';
          
          const eventData = {
            userId: req.user.id,
            userName: userName,
            tenantId: tenantId,
            documentId: docId,
            documentName: docName,
          };
          
          eventService.emit(EventType.OCR_FEEDBACK_SUBMITTED, eventData);
        } else {
          console.warn('User information not available in request (req.user.id missing), skipping OCR feedback notification.');
        }
      } catch (eventError) {
        console.error('Failed to emit OCR_FEEDBACK_SUBMITTED event:', eventError);
      }

      res.status(200).json({
        success: true,
        message: 'Feedback enregistré avec succès'
      });

    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Une erreur est survenue lors de l\'enregistrement du feedback',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Sauvegarde les données extraites modifiées manuellement
   * @param req Requête HTTP contenant les données extraites modifiées
   * @param res Réponse HTTP
   */
  public async saveEditedData(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { editedData, documentId } = req.body;

      if (!editedData) {
        res.status(400).json({ 
          success: false, 
          message: 'Données manquantes: editedData est requis' 
        });
        return;
      }

      // Valider les données de base
      if (editedData.montant && isNaN(Number(editedData.montant))) {
        res.status(400).json({
          success: false,
          message: 'Le montant doit être un nombre valide'
        });
        return;
      }

      if (editedData.tva && isNaN(Number(editedData.tva))) {
        res.status(400).json({
          success: false,
          message: 'La TVA doit être un nombre valide'
        });
        return;
      }

      // Sauvegarder les données modifiées
      const result = await ocrService.saveEditedData(editedData, documentId);

      res.status(200).json({
        success: true,
        message: 'Données modifiées sauvegardées avec succès',
        data: result.data
      });
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données modifiées:', error);
      res.status(500).json({
        success: false,
        message: 'Une erreur est survenue lors de la sauvegarde des données modifiées',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Récupère les patterns d'apprentissage adaptatif
   * @param req Requête HTTP
   * @param res Réponse HTTP
   */
  public async getLearningPatterns(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Paramètres optionnels de filtrage
      const { accountCode, minConfidence, minOccurrences, limit } = req.query;
      const tenantId = req.tenant?.id;

      if (!tenantId) {
        res.status(403).json({ success: false, message: 'Accès non autorisé ou tenant non identifié.' });
        return;
      }
      
      // Récupérer les patterns
      const patterns = await adaptiveLearningService.getPatterns(tenantId, {
        accountCode: accountCode as string,
        minConfidence: minConfidence ? parseFloat(minConfidence as string) : undefined,
        minOccurrences: minOccurrences ? parseInt(minOccurrences as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined
      });
      
      res.status(200).json({
        success: true,
        count: patterns.length,
        data: patterns
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des patterns d\'apprentissage:', error);
      res.status(500).json({
        success: false,
        message: 'Une erreur est survenue lors de la récupération des patterns d\'apprentissage',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * Récupère les métriques de performance
   * @param req Requête HTTP
   * @param res Réponse HTTP
   */
  public async getPerformanceMetrics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tenantId = req.tenant?.id;
      
      if (!tenantId) {
        res.status(403).json({ success: false, message: 'Accès non autorisé ou tenant non identifié.' });
        return;
      }
      
      const metrics = await adaptiveLearningService.getPerformanceMetrics(tenantId);
      res.status(200).json({
        success: true,
        data: metrics
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des métriques de performance:', error);
      res.status(500).json({
        success: false,
        message: 'Une erreur est survenue lors de la récupération des métriques de performance',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
}

export default new OcrController();
