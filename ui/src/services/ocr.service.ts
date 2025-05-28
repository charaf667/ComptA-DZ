import axios from 'axios';
import type { ExtractedData, FeedbackData } from '../types/ocr';
import type { AccountSuggestion, JournalEntry } from '../types/accounting';

// Utilisation de la syntaxe Vite pour les variables d'environnement
// Correction du port pour correspondre à celui utilisé par le backend (4000 au lieu de 5000)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Utilisation des types définis dans ../types/ocr.ts et ../types/accounting.ts

// Interfaces pour les résultats des API
export interface JournalEntryLine {
  compteCode: string;
  libelleCompte: string;
  montantDebit: number;
  montantCredit: number;
}

export interface ClassificationResult {
  suggestions: AccountSuggestion[];
  ecritureProposee: JournalEntry | null;
}

export interface ProcessResult {
  extractedData: ExtractedData;
  classification: ClassificationResult;
}

class OcrService {
  /**
   * Envoie un fichier pour extraction de données
   */
  async extractData(file: File): Promise<ExtractedData> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/ocr/extract`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    return response.data.data;
  }

  /**
   * Envoie les données extraites pour classification
   */
  async classifyDocument(extractedData: ExtractedData): Promise<ClassificationResult> {
    const response = await axios.post(`${API_URL}/ocr/classify`, { extractedData });
    return response.data.data;
  }

  /**
   * Traite un fichier et le classifie en une seule étape
   */
  async processFile(file: File): Promise<ProcessResult> {
    // Ajouter des informations de diagnostic sur le fichier
    console.log('Détails du fichier:', {
      nom: file.name,
      type: file.type,
      taille: `${(file.size / 1024).toFixed(2)} KB`,
      derniereMod: new Date(file.lastModified).toISOString()
    });

    // Vérifier si c'est un PDF généré par ChatGPT (basé sur le nom ou d'autres attributs)
    const isChatGptPdf = file.name.toLowerCase().includes('chatgpt') || 
                        file.name.toLowerCase().includes('gpt') ||
                        file.name.toLowerCase().includes('exemple');

    if (isChatGptPdf) {
      console.log('PDF potentiellement généré par ChatGPT détecté, utilisation du mode de compatibilité');
    }

    const formData = new FormData();
    formData.append('file', file);
    
    // Ajouter un flag pour indiquer si c'est un PDF généré par ChatGPT
    if (isChatGptPdf) {
      formData.append('isChatGptPdf', 'true');
    }

    try {
      const response = await axios.post(`${API_URL}/ocr/process`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        extractedData: response.data.extractedData,
        classification: response.data.classification
      };
    } catch (error: any) {
      // Amélioration de la gestion des erreurs avec plus de détails
      console.error('Erreur détaillée lors du traitement OCR:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers
      });
      
      throw error;
    }
  }

  /**
   * Envoie le feedback de l'utilisateur sur une suggestion pour améliorer l'apprentissage adaptatif
   */
  async sendFeedback(feedbackData: FeedbackData): Promise<void> {
    try {
      await axios.post(`${API_URL}/ocr/feedback`, feedbackData);
      console.log('Feedback envoyé avec succès');
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du feedback:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Sauvegarde les données extraites modifiées manuellement
   * @param editedData Les données modifiées à sauvegarder
   * @param documentId Identifiant optionnel du document
   * @returns Les données sauvegardées avec des métadonnées supplémentaires
   */
  async saveEditedData(editedData: ExtractedData, documentId?: string): Promise<ExtractedData> {
    try {
      const response = await axios.post(`${API_URL}/ocr/save-edited-data`, {
        editedData,
        documentId
      });
      
      console.log('Données modifiées sauvegardées avec succès');
      return response.data.data;
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde des données modifiées:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }
}

export default new OcrService();
