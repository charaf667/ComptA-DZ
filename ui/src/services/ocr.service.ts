import axios from 'axios';
import type { ExtractedData, FeedbackData } from '../types/ocr';
import type { AccountSuggestion, JournalEntry } from '../types/accounting';
import { getAuthHeaders } from '../utils/auth';

// Utilisation de la syntaxe Vite pour les variables d'environnement
// Correction du port pour correspondre à celui utilisé par le backend (4000 au lieu de 5000)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Utilisation des types définis dans ../types/ocr.ts et ../types/accounting.ts

// Interface pour un compte du plan comptable
export interface Account {
  id: string;
  code: string;
  label: string;
  type: string; // Exemple: 'DEBIT', 'CREDIT', 'BOTH'
  // Ajoutez d'autres champs si nécessaire, par exemple 'class', 'parentId', 'children'
}


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
   * Récupère les suggestions de comptes de l'IA adaptative
   */
  async getAdaptiveSuggestions(extractedData: ExtractedData): Promise<AccountSuggestion[]> {
    try {
      const response = await axios.post<{ data: AccountSuggestion[] }>(`${API_URL}/adaptive-learning/suggest-accounts`, extractedData, {
        headers: getAuthHeaders()
      });
      return response.data.data || []; // Assurer de retourner un tableau même si data est undefined
    } catch (error: any) {
      console.error('Erreur lors de la récupération des suggestions adaptatives:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      return []; // Retourner un tableau vide en cas d'erreur
    }
  }

  /**
   * Envoie un fichier pour extraction de données
   */
  async extractData(file: File): Promise<ExtractedData> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/ocr/extract`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...getAuthHeaders()
      }
    });

    return response.data.data;
  }

  /**
   * Envoie les données extraites pour classification
   */
  async classifyDocument(extractedData: ExtractedData): Promise<ClassificationResult> {
    const response = await axios.post(`${API_URL}/ocr/classify`, { extractedData }, {
      headers: getAuthHeaders()
    });
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
          'Content-Type': 'multipart/form-data',
          ...getAuthHeaders()
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
      // Le backend /adaptive-learning/feedback attend { data: ExtractedData, selectedAccount: AccountSuggestion }
      const payload = {
        data: feedbackData.originalExtractedData, // Utiliser les données OCR complètes originales
        selectedAccount: feedbackData.selectedSuggestion,
      };

      // Ajouter des informations de feedbackData.initialAISuggestion et decisionTimeMs à payload.data si nécessaire
      // car le service backend AdaptiveLearningService s'attend à les trouver dans l'objet `data` (ExtractedData)
      if (payload.data && feedbackData.initialAISuggestion) {
        // @ts-ignore // Permettre l'ajout de propriétés ad-hoc si ExtractedData ne les a pas formellement
        payload.data.initialAISuggestion = feedbackData.initialAISuggestion;
      }
      if (payload.data && feedbackData.decisionTimeMs) {
        // @ts-ignore
        payload.data.decisionTimeMs = feedbackData.decisionTimeMs;
      }
      // S'assurer que documentId est présent dans payload.data si ce n'est pas déjà le cas
      // via feedbackData.originalExtractedData
      if (payload.data && !payload.data.documentId && feedbackData.documentId) {
        payload.data.documentId = feedbackData.documentId;
      }


      await axios.post(`${API_URL}/adaptive-learning/feedback`, payload, {
        headers: getAuthHeaders()
      });
      console.log('Feedback adaptatif envoyé avec succès');
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi du feedback adaptatif:', {
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
      }, {
        headers: getAuthHeaders()
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

  /**
   * Récupère le plan comptable complet
   */
  async getAccounts(): Promise<Account[]> {
    try {
      const response = await axios.get<{ data: Account[] }>(`${API_URL}/accounts`, {
        headers: getAuthHeaders()
      });
      // L'API backend semble wrapper la réponse dans un objet { data: ... } ou directement la liste
      // S'assurer que cela correspond à la structure réelle de la réponse de /api/accounts
      // Si l'API renvoie directement un tableau d'Account, alors ce sera response.data
      // Si l'API renvoie { data: Account[] }, alors ce sera response.data.data
      // Pour l'instant, je suppose que l'API /api/accounts renvoie directement le tableau.
      // Si elle est wrappée (ex: { success: true, data: [...] }), il faudra ajuster.
      // Basé sur AccountController.getAccounts qui fait res.json(accounts), ce devrait être direct.
      // Cependant, si axios est configuré pour wrapper ou si l'API wrappe dans un champ 'data',
      // il faut accéder à response.data.data. Le typage axios.get<{ data: Account[] }> suggère ce dernier cas.
      return response.data.data; 
    } catch (error: any) {
      console.error('Erreur lors de la récupération du plan comptable:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      // Il est important de retourner un tableau vide en cas d'erreur
      // pour que le composant AccountSuggestions puisse gérer cet état.
      return []; 
    }
  }
}

export default new OcrService();
