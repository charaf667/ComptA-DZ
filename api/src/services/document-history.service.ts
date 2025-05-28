import fs from 'fs';
import path from 'path';
import { ExtractedData } from './ocr.service';
import { AccountSuggestion } from './ai-classification.service';

/**
 * Interface représentant un document traité par OCR
 */
export interface ProcessedDocument {
  id: string;
  filename: string;
  processedAt: string;
  extractedData: ExtractedData;
  selectedAccount?: AccountSuggestion;
  isEdited: boolean;
  lastEditedAt?: string;
  tags?: string[];
  userId?: string; // Pour une future implémentation multi-utilisateurs
}

/**
 * Options de filtrage pour la recherche de documents
 */
export interface DocumentFilterOptions {
  startDate?: string;
  endDate?: string;
  fournisseur?: string;
  montantMin?: number;
  montantMax?: number;
  compteCode?: string;
  isEdited?: boolean;
  tags?: string[];
  searchText?: string;
  limit?: number;
  offset?: number;
}

/**
 * Service de gestion de l'historique des documents traités par OCR
 */
export class DocumentHistoryService {
  private dataPath: string;
  private documents: ProcessedDocument[] = [];

  constructor() {
    this.dataPath = path.join(__dirname, '..', '..', 'data', 'document-history.json');
    this.loadDocuments();
  }

  /**
   * Charge l'historique des documents depuis le fichier
   */
  private loadDocuments(): void {
    try {
      // Créer le dossier data s'il n'existe pas
      const dataDir = path.dirname(this.dataPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Charger les documents s'ils existent
      if (fs.existsSync(this.dataPath)) {
        const data = fs.readFileSync(this.dataPath, 'utf8');
        this.documents = JSON.parse(data);
        console.log(`Historique des documents chargé: ${this.documents.length} documents`);
      } else {
        // Créer un fichier vide si inexistant
        this.documents = [];
        fs.writeFileSync(this.dataPath, JSON.stringify(this.documents, null, 2));
        console.log('Fichier d\'historique des documents créé');
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique des documents:', error);
      this.documents = [];
    }
  }

  /**
   * Sauvegarde l'historique des documents dans le fichier
   */
  private saveDocuments(): void {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(this.documents, null, 2));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'historique des documents:', error);
    }
  }

  /**
   * Ajoute un document à l'historique
   * @param filename Nom du fichier original
   * @param extractedData Données extraites du document
   * @param selectedAccount Compte sélectionné (optionnel)
   * @returns Le document ajouté
   */
  public addDocument(
    filename: string,
    extractedData: ExtractedData,
    selectedAccount?: AccountSuggestion
  ): ProcessedDocument {
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

    this.documents.push(document);
    this.saveDocuments();

    return document;
  }

  /**
   * Met à jour un document existant
   * @param id Identifiant du document
   * @param updates Mises à jour à appliquer
   * @returns Le document mis à jour ou null si non trouvé
   */
  public updateDocument(
    id: string,
    updates: Partial<ProcessedDocument>
  ): ProcessedDocument | null {
    const index = this.documents.findIndex(doc => doc.id === id);
    
    if (index === -1) {
      return null;
    }

    // Marquer comme édité si les données extraites sont modifiées
    if (updates.extractedData) {
      updates.isEdited = true;
      updates.lastEditedAt = new Date().toISOString();
    }

    // Appliquer les mises à jour
    this.documents[index] = {
      ...this.documents[index],
      ...updates
    };

    this.saveDocuments();
    return this.documents[index];
  }

  /**
   * Récupère un document par son identifiant
   * @param id Identifiant du document
   * @returns Le document ou null si non trouvé
   */
  public getDocumentById(id: string): ProcessedDocument | null {
    return this.documents.find(doc => doc.id === id) || null;
  }

  /**
   * Supprime un document de l'historique
   * @param id Identifiant du document
   * @returns true si le document a été supprimé, false sinon
   */
  public deleteDocument(id: string): boolean {
    const initialLength = this.documents.length;
    this.documents = this.documents.filter(doc => doc.id !== id);
    
    if (this.documents.length !== initialLength) {
      this.saveDocuments();
      return true;
    }
    
    return false;
  }

  /**
   * Recherche des documents selon les critères spécifiés
   * @param options Options de filtrage
   * @returns Liste des documents correspondants
   */
  public searchDocuments(options: DocumentFilterOptions = {}): ProcessedDocument[] {
    let results = [...this.documents];

    // Filtrage par date
    if (options.startDate) {
      results = results.filter(doc => doc.processedAt >= options.startDate!);
    }
    
    if (options.endDate) {
      results = results.filter(doc => doc.processedAt <= options.endDate!);
    }

    // Filtrage par fournisseur
    if (options.fournisseur) {
      const searchTerm = options.fournisseur.toLowerCase();
      results = results.filter(doc => 
        doc.extractedData.fournisseur?.toLowerCase().includes(searchTerm)
      );
    }

    // Filtrage par montant
    if (options.montantMin !== undefined) {
      results = results.filter(doc => {
        const montant = doc.extractedData.montant;
        return montant !== undefined && montant >= options.montantMin!;
      });
    }
    
    if (options.montantMax !== undefined) {
      results = results.filter(doc => {
        const montant = doc.extractedData.montant;
        return montant !== undefined && montant <= options.montantMax!;
      });
    }

    // Filtrage par compte
    if (options.compteCode) {
      results = results.filter(doc => 
        doc.selectedAccount?.compteCode === options.compteCode
      );
    }

    // Filtrage par statut d'édition
    if (options.isEdited !== undefined) {
      results = results.filter(doc => doc.isEdited === options.isEdited);
    }

    // Filtrage par tags
    if (options.tags && options.tags.length > 0) {
      results = results.filter(doc => 
        doc.tags && options.tags!.some(tag => doc.tags!.includes(tag))
      );
    }

    // Recherche textuelle
    if (options.searchText) {
      const searchTerm = options.searchText.toLowerCase();
      results = results.filter(doc => {
        const extractedData = doc.extractedData;
        return (
          extractedData.libelle?.toLowerCase().includes(searchTerm) ||
          extractedData.fournisseur?.toLowerCase().includes(searchTerm) ||
          extractedData.reference?.toLowerCase().includes(searchTerm) ||
          extractedData.numeroFacture?.toLowerCase().includes(searchTerm) ||
          doc.filename.toLowerCase().includes(searchTerm)
        );
      });
    }

    // Tri par date de traitement (plus récent d'abord)
    results.sort((a, b) => new Date(b.processedAt).getTime() - new Date(a.processedAt).getTime());

    // Pagination
    if (options.offset !== undefined || options.limit !== undefined) {
      const offset = options.offset || 0;
      const limit = options.limit || results.length;
      results = results.slice(offset, offset + limit);
    }

    return results;
  }

  /**
   * Récupère les statistiques sur les documents traités
   * @returns Statistiques des documents
   */
  public getStatistics() {
    const totalDocuments = this.documents.length;
    const editedDocuments = this.documents.filter(doc => doc.isEdited).length;
    const taggedDocuments = this.documents.filter(doc => doc.tags && doc.tags.length > 0).length;
    
    // Calcul du nombre de documents des 30 derniers jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString();
    const last30DaysDocuments = this.documents.filter(doc => doc.processedAt >= thirtyDaysAgoStr).length;
    
    // Calcul du montant total
    let totalAmount = 0;
    let documentsWithAmount = 0;
    
    for (const doc of this.documents) {
      const montant = doc.extractedData.montant;
      if (montant !== undefined) {
        totalAmount += montant;
        documentsWithAmount++;
      }
    }

    // Comptes les plus utilisés
    const accountCounts: Record<string, number> = {};
    for (const doc of this.documents) {
      if (doc.selectedAccount?.compteCode) {
        const code = doc.selectedAccount.compteCode;
        accountCounts[code] = (accountCounts[code] || 0) + 1;
      }
    }

    const topAccounts = Object.entries(accountCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([code, count]) => ({
        compteCode: code,
        libelleCompte: this.documents.find(doc => 
          doc.selectedAccount?.compteCode === code
        )?.selectedAccount?.libelleCompte || `Compte ${code}`,
        count
      }));

    // Fournisseurs les plus fréquents
    const supplierCounts: Record<string, number> = {};
    for (const doc of this.documents) {
      const fournisseur = doc.extractedData.fournisseur;
      
      if (fournisseur) {
        supplierCounts[fournisseur] = (supplierCounts[fournisseur] || 0) + 1;
      }
    }

    const topSuppliers = Object.entries(supplierCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Tags les plus utilisés
    const tagCounts: Record<string, number> = {};
    for (const doc of this.documents) {
      if (doc.tags) {
        for (const tag of doc.tags) {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        }
      }
    }

    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      totalDocuments,
      editedDocuments,
      taggedDocuments,
      last30DaysDocuments,
      averageAmount: documentsWithAmount > 0 ? totalAmount / documentsWithAmount : 0,
      topAccounts,
      topSuppliers,
      topTags,
      documentsPerMonth: this.getDocumentsPerMonth()
    };
  }

  /**
   * Calcule le nombre de documents traités par mois
   * @returns Nombre de documents par mois
   */
  private getDocumentsPerMonth(): { month: string; count: number }[] {
    const monthCounts: Record<string, number> = {};
    
    for (const doc of this.documents) {
      const date = new Date(doc.processedAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + 1;
    }

    // Convertir en tableau et trier par mois
    return Object.entries(monthCounts)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Ajoute un tag à un document
   * @param id Identifiant du document
   * @param tag Tag à ajouter
   * @returns Le document mis à jour ou null si non trouvé
   */
  public addTag(id: string, tag: string): ProcessedDocument | null {
    const document = this.getDocumentById(id);
    
    if (!document) {
      return null;
    }

    if (!document.tags) {
      document.tags = [];
    }

    if (!document.tags.includes(tag)) {
      document.tags.push(tag);
      return this.updateDocument(id, { tags: document.tags });
    }

    return document;
  }

  /**
   * Supprime un tag d'un document
   * @param id Identifiant du document
   * @param tag Tag à supprimer
   * @returns Le document mis à jour ou null si non trouvé
   */
  public removeTag(id: string, tag: string): ProcessedDocument | null {
    const document = this.getDocumentById(id);
    
    if (!document || !document.tags) {
      return null;
    }

    const updatedTags = document.tags.filter(t => t !== tag);
    return this.updateDocument(id, { tags: updatedTags });
  }
}

export default new DocumentHistoryService();