import type { ExtractedData } from './ocr';
import type { AccountSuggestion } from './accounting';

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
  userId?: string;
  hasAccountingEntry?: boolean;
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
 * Statistiques sur les documents traités
 */
export interface DocumentStatistics {
  totalDocuments: number;
  editedDocuments: number;
  taggedDocuments: number;
  last30DaysDocuments: number;
  averageAmount: number;
  topAccounts: {
    compteCode: string;
    libelleCompte: string;
    count: number;
  }[];
  topSuppliers: {
    name: string;
    count: number;
  }[];
  topTags: {
    name: string;
    count: number;
  }[];
  documentsPerMonth: {
    month: string;
    count: number;
  }[];
}

/**
 * Résultat de la recherche de documents
 */
export interface DocumentSearchResult {
  success: boolean;
  count: number;
  data: ProcessedDocument[];
}

/**
 * Résultat de l'ajout ou de la mise à jour d'un document
 */
export interface DocumentActionResult {
  success: boolean;
  message: string;
  data?: ProcessedDocument;
}

/**
 * Résultat de la récupération des statistiques
 */
export interface StatisticsResult {
  success: boolean;
  data: DocumentStatistics;
}
