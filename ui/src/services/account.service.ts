import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

/**
 * Service pour gérer les comptes du plan comptable
 */
export class AccountService {
  /**
   * Récupère tous les comptes
   */
  async getAllAccounts() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_URL}/accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des comptes:', error);
      throw error;
    }
  }

  /**
   * Récupère un compte par son ID
   */
  async getAccountById(id: string) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.get(`${API_URL}/accounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération du compte ${id}:`, error);
      throw error;
    }
  }

  /**
   * Crée un nouveau compte
   */
  async createAccount(accountData: {
    code: string;
    label: string;
    classe: number;
    type: 'debit' | 'credit';
    category?: 'detail' | 'collectif';
    parentCode?: string;
  }) {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Validation des données
      if (!accountData.code || !accountData.label || accountData.classe === undefined || !accountData.type) {
        throw new Error('Tous les champs obligatoires doivent être remplis');
      }
      
      // S'assurer que classe est un nombre valide
      const classe = parseInt(String(accountData.classe), 10);
      if (isNaN(classe)) {
        throw new Error('La classe doit être un nombre valide');
      }
      
      // Conversion en minuscules et nettoyage du payload (conforme au validateur backend)
      const payload: Record<string, any> = {
        code: accountData.code.trim(),
        label: accountData.label.trim(),
        classe: classe,
        type: accountData.type.toLowerCase(), // minuscules pour le validateur
        category: accountData.category ? accountData.category.toLowerCase() : 'detail' // minuscules pour le validateur
      };
      
      // Ajouter parentCode uniquement s'il est spécifié et non vide
      if (accountData.parentCode && accountData.parentCode.trim() !== "") {
        payload.parentCode = accountData.parentCode.trim();
      }
      
      console.log('Envoi de la requête avec payload:', payload);
      
      const response = await axios.post(`${API_URL}/accounts`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return response.data;
    } catch (error: any) {
      // Gestion détaillée des erreurs
      if (error.response && error.response.data) {
        console.error('Réponse d\'erreur du backend:', error.response.data);
        throw new Error(error.response.data.message || 'Erreur lors de la création du compte');
      }
      console.error('Erreur lors de la création du compte:', error);
      throw error;
    }
  }

  /**
   * Met à jour un compte existant
   */
  async updateAccount(id: string, accountData: {
    label?: string;
    isActive?: boolean;
    category?: 'detail' | 'collectif';
    type?: 'debit' | 'credit';
    parentCode?: string;
  }) {
    try {
      const token = localStorage.getItem('auth_token');
      
      // Préparation du payload avec conversion en minuscules pour les enums
      const payload: Record<string, any> = {};
      
      if (accountData.label) payload.label = accountData.label.trim();
      if (accountData.isActive !== undefined) payload.isActive = accountData.isActive;
      if (accountData.category) payload.category = accountData.category.toLowerCase();
      if (accountData.type) payload.type = accountData.type.toLowerCase();
      
      // Ajouter parentCode uniquement s'il est spécifié et non vide
      if (accountData.parentCode && accountData.parentCode.trim() !== "") {
        payload.parentCode = accountData.parentCode.trim();
      } else if (accountData.parentCode === "") {
        // Si vide explicitement, on indique qu'on veut retirer le parent
        payload.parentCode = null;
      }
      
      console.log('Envoi de la mise à jour avec payload:', payload);
      
      const response = await axios.put(`${API_URL}/accounts/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        console.error('Réponse d\'erreur du backend:', error.response.data);
        throw new Error(error.response.data.message || `Erreur lors de la mise à jour du compte ${id}`);
      }
      console.error(`Erreur lors de la mise à jour du compte ${id}:`, error);
      throw error;
    }
  }

  /**
   * Supprime un compte
   */
  async deleteAccount(id: string) {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.delete(`${API_URL}/accounts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la suppression du compte ${id}:`, error);
      throw error;
    }
  }

  /**
   * Importe le plan comptable par défaut
   */
  /**
   * Importe un plan comptable depuis un fichier CSV
   */
  async importChartOfAccountsFromCsv(file: File) {
    try {
      const token = localStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post(
        `${API_URL}/accounts/import-csv`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response && error.response.data) {
        throw new Error(error.response.data.message || 'Erreur lors de l\'import CSV');
      }
      throw error;
    }
  }

  async importDefaultChartOfAccounts() {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await axios.post(`${API_URL}/accounts/import-default`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de l\'import du plan comptable par défaut:', error);
      throw error;
    }
  }
}

export default new AccountService();
