import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Service pour gérer les écritures comptables
 */
export class AccountingEntriesService {
  /**
   * Génère une écriture comptable à partir d'un document
   */
  async generateEntry(data: {
    documentId: string;
    accountCode: string;
    amount: number;
    supplier?: string;
    date?: string;
    description?: string;
  }) {
    try {
      const response = await axios.post(`${API_URL}/accounting-entries/generate`, data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la génération de l\'écriture comptable:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les écritures comptables
   */
  async getAllEntries() {
    try {
      const response = await axios.get(`${API_URL}/accounting-entries`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des écritures comptables:', error);
      throw error;
    }
  }

  /**
   * Récupère les écritures comptables liées à un document
   */
  async getEntriesByDocumentId(documentId: string) {
    try {
      const response = await axios.get(`${API_URL}/accounting-entries/document/${documentId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des écritures comptables:', error);
      throw error;
    }
  }
}

export default new AccountingEntriesService();
