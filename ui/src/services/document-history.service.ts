import axios from 'axios';
import type { ExtractedData } from '../types/ocr';
import type { AccountSuggestion } from '../types/accounting';
import type {
  ProcessedDocument,
  DocumentFilterOptions,
  DocumentStatistics,
  DocumentSearchResult,
  DocumentActionResult,
  StatisticsResult
} from '../types/document-history';

// Utilisation de la syntaxe Vite pour les variables d'environnement
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const DOCUMENT_HISTORY_API = `${API_URL}/document-history`;

class DocumentHistoryService {
  // Méthodes temporaires pour simuler les données
  private getMockDocuments(): ProcessedDocument[] {
    const mockDocuments: ProcessedDocument[] = [
      {
        id: 'doc_1',
        filename: 'facture-electricite.pdf',
        processedAt: new Date(2025, 4, 25).toISOString(),
        extractedData: {
          date: '2025-05-20',
          montant: 1250.75,
          tva: 200.12,
          fournisseur: 'Sonelgaz',
          libelle: 'Facture d\'électricité Mai 2025',
          reference: 'ELEC-2025-05-123456',
          confidence: 0.92
        },
        selectedAccount: {
          compteCode: '6125',
          libelleCompte: 'Électricité',
          classe: 6,
          scoreConfiance: 0.95,
          justification: 'Facture d\'électricité',
          source: 'classification'
        },
        isEdited: false,
        tags: ['électricité', 'mensuel']
      },
      {
        id: 'doc_2',
        filename: 'facture-telephone.pdf',
        processedAt: new Date(2025, 4, 26).toISOString(),
        extractedData: {
          date: '2025-05-22',
          montant: 750.50,
          tva: 120.08,
          fournisseur: 'Algérie Télécom',
          libelle: 'Facture téléphone et internet Mai 2025',
          reference: 'TEL-2025-05-789012',
          confidence: 0.88
        },
        selectedAccount: {
          compteCode: '6262',
          libelleCompte: 'Frais de télécommunications',
          classe: 6,
          scoreConfiance: 0.92,
          justification: 'Facture de téléphone et internet',
          source: 'adaptive'
        },
        isEdited: true,
        lastEditedAt: new Date(2025, 4, 26, 14, 30).toISOString(),
        tags: ['télécom', 'mensuel']
      },
      {
        id: 'doc_3',
        filename: 'facture-fournitures.pdf',
        processedAt: new Date(2025, 4, 27).toISOString(),
        extractedData: {
          date: '2025-05-24',
          montant: 3200.00,
          tva: 512.00,
          fournisseur: 'Papeterie Centrale',
          libelle: 'Fournitures de bureau',
          reference: 'FCT-2025-05-345678',
          confidence: 0.85
        },
        selectedAccount: {
          compteCode: '6064',
          libelleCompte: 'Fournitures de bureau',
          classe: 6,
          scoreConfiance: 0.89,
          justification: 'Achat de fournitures de bureau',
          source: 'manual'
        },
        isEdited: false,
        tags: ['fournitures', 'bureau']
      }
    ];
    
    return mockDocuments;
  }
  
  private getMockStatistics(): DocumentStatistics {
    return {
      totalDocuments: 15,
      editedDocuments: 4,
      taggedDocuments: 10,
      last30DaysDocuments: 12,
      averageAmount: 1850.45,
      topAccounts: [
        { compteCode: '6064', libelleCompte: 'Fournitures de bureau', count: 5 },
        { compteCode: '6125', libelleCompte: 'Électricité', count: 3 },
        { compteCode: '6262', libelleCompte: 'Frais de télécommunications', count: 2 }
      ],
      topSuppliers: [
        { name: 'Papeterie Centrale', count: 4 },
        { name: 'Sonelgaz', count: 3 },
        { name: 'Algérie Télécom', count: 2 }
      ],
      topTags: [
        { name: 'mensuel', count: 8 },
        { name: 'fournitures', count: 5 },
        { name: 'électricité', count: 3 }
      ],
      documentsPerMonth: [
        { month: '2025-04', count: 3 },
        { month: '2025-05', count: 12 }
      ]
    };
  }

  /**
   * Ajoute un document à l'historique
   * @param filename Nom du fichier original
   * @param extractedData Données extraites du document
   * @param selectedAccount Compte sélectionné (optionnel)
   * @returns Le document ajouté
   */
  async addDocument(
    filename: string,
    extractedData: ExtractedData,
    selectedAccount?: AccountSuggestion
  ): Promise<ProcessedDocument> {
    try {
      const now = new Date().toISOString();
      
      const document: ProcessedDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        filename,
        processedAt: now,
        extractedData,
        selectedAccount,
        isEdited: false,
        tags: []
      };
      
      try {
        const response = await axios.post<DocumentActionResult>(
          DOCUMENT_HISTORY_API,
          document
        );
        
        console.log('Document ajouté avec succès');
        // Correction de l'erreur TypeScript en utilisant le type assertion
        return response.data.data as ProcessedDocument;
      } catch (apiError) {
        console.warn('API non disponible, utilisation de données simulées');
        // document est déjà de type ProcessedDocument
        return document;
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du document:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Récupère un document par son identifiant
   * @param id Identifiant du document
   * @returns Le document
   */
  async getDocument(id: string): Promise<ProcessedDocument> {
    try {
      const response = await axios.get<DocumentActionResult>(`${DOCUMENT_HISTORY_API}/${id}`);
      return response.data.data as ProcessedDocument;
    } catch (error: any) {
      console.error('Erreur lors de la récupération du document:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Met à jour un document existant
   * @param id Identifiant du document
   * @param updates Mises à jour à appliquer
   * @returns Le document mis à jour
   */
  async updateDocument(
    id: string,
    updates: Partial<ProcessedDocument>
  ): Promise<ProcessedDocument> {
    try {
      const response = await axios.put<DocumentActionResult>(
        `${DOCUMENT_HISTORY_API}/${id}`,
        updates
      );

      console.log('Document mis à jour avec succès');
      return response.data.data as ProcessedDocument;
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du document:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Supprime un document de l'historique
   * @param id Identifiant du document
   * @returns true si le document a été supprimé
   */
  async deleteDocument(id: string): Promise<boolean> {
    try {
      const response = await axios.delete<{ success: boolean; message: string }>(
        `${DOCUMENT_HISTORY_API}/${id}`
      );

      console.log('Document supprimé avec succès');
      return response.data.success;
    } catch (error: any) {
      console.error('Erreur lors de la suppression du document:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Recherche des documents selon les critères spécifiés
   * @param options Options de filtrage
   * @returns Liste des documents correspondants
   */
  async searchDocuments(options: DocumentFilterOptions = {}): Promise<ProcessedDocument[]> {
    try {
      // Convertir les options en paramètres de requête
      const params = new URLSearchParams();
      
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      if (options.fournisseur) params.append('fournisseur', options.fournisseur);
      if (options.montantMin !== undefined) params.append('montantMin', options.montantMin.toString());
      if (options.montantMax !== undefined) params.append('montantMax', options.montantMax.toString());
      if (options.compteCode) params.append('compteCode', options.compteCode);
      if (options.isEdited !== undefined) params.append('isEdited', options.isEdited.toString());
      if (options.searchText) params.append('searchText', options.searchText);
      if (options.limit !== undefined) params.append('limit', options.limit.toString());
      if (options.offset !== undefined) params.append('offset', options.offset.toString());
      
      // Ajouter les tags s'ils existent
      if (options.tags && options.tags.length > 0) {
        options.tags.forEach(tag => params.append('tags', tag));
      }

      try {
        const response = await axios.get<DocumentSearchResult>(
          `${DOCUMENT_HISTORY_API}/search`,
          { params }
        );
        return response.data.data;
      } catch (apiError) {
        console.warn('API non disponible, utilisation de données simulées');
        return this.getMockDocuments();
      }
    } catch (error: any) {
      console.error('Erreur lors de la recherche de documents:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      // Retourner des données simulées en cas d'erreur
      return this.getMockDocuments();
    }
  }

  /**
   * Récupère les statistiques sur les documents traités
   * @returns Statistiques des documents
   */
  async getStatistics(): Promise<DocumentStatistics> {
    try {
      try {
        const response = await axios.get<StatisticsResult>(`${DOCUMENT_HISTORY_API}/statistics`);
        return response.data.data;
      } catch (apiError) {
        console.warn('API non disponible, utilisation de statistiques simulées');
        return this.getMockStatistics();
      }
    } catch (error: any) {
      console.error('Erreur lors de la récupération des statistiques:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      // Retourner des statistiques simulées en cas d'erreur
      return this.getMockStatistics();
    }
  }

  /**
   * Ajoute un tag à un document
   * @param id Identifiant du document
   * @param tag Tag à ajouter
   * @returns Le document mis à jour
   */
  async addTag(id: string, tag: string): Promise<ProcessedDocument> {
    try {
      const response = await axios.post<DocumentActionResult>(
        `${DOCUMENT_HISTORY_API}/${id}/tags`,
        { tag }
      );

      console.log('Tag ajouté avec succès');
      return response.data.data as ProcessedDocument;
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du tag:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  /**
   * Supprime un tag d'un document
   * @param id Identifiant du document
   * @param tag Tag à supprimer
   * @returns Le document mis à jour
   */
  async removeTag(id: string, tag: string): Promise<ProcessedDocument> {
    try {
      const response = await axios.delete<DocumentActionResult>(
        `${DOCUMENT_HISTORY_API}/${id}/tags/${tag}`
      );

      console.log('Tag supprimé avec succès');
      return response.data.data as ProcessedDocument;
    } catch (error: any) {
      console.error('Erreur lors de la suppression du tag:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }
}

export default new DocumentHistoryService();
