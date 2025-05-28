import api from './api';

// Types pour les factures
export interface Invoice {
  id: string;
  reference: string;
  fournisseur: string;
  montant: number;
  montantFormate?: string;
  date: string;
  statut: 'En attente' | 'Validé' | 'Rejeté';
  type: string;
  description?: string;
  fichierUrl?: string;
  tenantId: string;
}

export interface InvoiceCreateData {
  reference: string;
  fournisseur: string;
  montant: number;
  date: string;
  type: string;
  description?: string;
  fichier?: File;
}

export interface InvoiceUpdateData {
  reference?: string;
  fournisseur?: string;
  montant?: number;
  date?: string;
  statut?: 'En attente' | 'Validé' | 'Rejeté';
  type?: string;
  description?: string;
}

/**
 * Service de gestion des factures
 */
class InvoiceService {
  /**
   * Récupérer toutes les factures
   * @returns Une promesse contenant les factures
   */
  async getAll(): Promise<Invoice[]> {
    try {
      const response = await api.get<Invoice[]>('/factures');
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Échec de la récupération des factures');
      }
      throw new Error('Impossible de se connecter au serveur');
    }
  }

  /**
   * Récupérer une facture par son ID
   * @param id - ID de la facture
   * @returns Une promesse contenant la facture
   */
  async getById(id: string): Promise<Invoice> {
    try {
      const response = await api.get<Invoice>(`/factures/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Échec de la récupération de la facture');
      }
      throw new Error('Impossible de se connecter au serveur');
    }
  }

  /**
   * Créer une nouvelle facture
   * @param data - Données de la facture
   * @returns Une promesse contenant la facture créée
   */
  async create(data: InvoiceCreateData): Promise<Invoice> {
    try {
      // Si on a un fichier, on utilise FormData
      if (data.fichier) {
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (key === 'fichier' && value instanceof File) {
            formData.append(key, value);
          } else if (value !== undefined) {
            formData.append(key, String(value));
          }
        });
        
        const response = await api.post<Invoice>('/factures', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        return response.data;
      }
      
      // Sinon, requête JSON standard
      const response = await api.post<Invoice>('/factures', data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Échec de la création de la facture');
      }
      throw new Error('Impossible de se connecter au serveur');
    }
  }

  /**
   * Mettre à jour une facture
   * @param id - ID de la facture
   * @param data - Données de mise à jour
   * @returns Une promesse contenant la facture mise à jour
   */
  async update(id: string, data: InvoiceUpdateData): Promise<Invoice> {
    try {
      const response = await api.put<Invoice>(`/factures/${id}`, data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Échec de la mise à jour de la facture');
      }
      throw new Error('Impossible de se connecter au serveur');
    }
  }

  /**
   * Supprimer une facture
   * @param id - ID de la facture
   * @returns Une promesse contenant un message de succès
   */
  async delete(id: string): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(`/factures/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Échec de la suppression de la facture');
      }
      throw new Error('Impossible de se connecter au serveur');
    }
  }

  /**
   * Rechercher des factures
   * @param query - Terme de recherche
   * @returns Une promesse contenant les factures correspondantes
   */
  async search(query: string): Promise<Invoice[]> {
    try {
      const response = await api.get<Invoice[]>(`/factures/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Échec de la recherche');
      }
      throw new Error('Impossible de se connecter au serveur');
    }
  }

  /**
   * Filtrer les factures par statut
   * @param status - Statut de la facture
   * @returns Une promesse contenant les factures filtrées
   */
  async filterByStatus(status: 'En attente' | 'Validé' | 'Rejeté'): Promise<Invoice[]> {
    try {
      const response = await api.get<Invoice[]>(`/factures/filter?statut=${encodeURIComponent(status)}`);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Échec du filtrage');
      }
      throw new Error('Impossible de se connecter au serveur');
    }
  }
}

export default new InvoiceService();
