import { Request, Response } from 'express';
import * as path from 'path';
import * as fs from 'fs-extra';
import ocrService from '../services/ocr.service';
import aiClassificationService from '../services/ai-classification.service';

export class OcrController {
  /**
   * Traite un fichier uploadé pour en extraire les données
   * @param req Requête HTTP
   * @param res Réponse HTTP
   */
  public async processFile(req: Request, res: Response): Promise<void> {
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
  public async classifyDocument(req: Request, res: Response): Promise<void> {
    try {
      const { extractedData } = req.body;

      if (!extractedData) {
        res.status(400).json({ success: false, message: 'Données extraites manquantes' });
        return;
      }

      const classification = aiClassificationService.classifyDocument(extractedData);

      res.status(200).json({
        success: true,
        data: classification
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
  public async processAndClassify(req: Request, res: Response): Promise<void> {
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

      // Classification des données extraites
      const classification = aiClassificationService.classifyDocument(extractedData);

      res.status(200).json({
        success: true,
        extractedData,
        classification
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
  public async recordFeedback(req: Request, res: Response): Promise<void> {
    try {
      const { extractedData, selectedAccount } = req.body;

      if (!extractedData || !selectedAccount) {
        res.status(400).json({ 
          success: false, 
          message: 'Données manquantes: extractedData et selectedAccount sont requis' 
        });
        return;
      }

      // Enregistrer le feedback dans le service de classification IA
      aiClassificationService.recordUserFeedback(extractedData, selectedAccount);

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
  public async saveEditedData(req: Request, res: Response): Promise<void> {
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
}

export default new OcrController();
