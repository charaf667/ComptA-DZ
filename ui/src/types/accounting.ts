import type { ExplanationDetail, ExplanationFactor } from './explanation';

/**
 * Représente une suggestion de compte comptable avec son score de confiance
 */
export interface AccountSuggestion {
  compteCode: string;
  libelleCompte: string;
  classe?: number; // Rendu optionnel
  scoreConfiance?: number; // Rendu optionnel
  justification?: string; // Rendu optionnel
  source?: 'classification' | 'adaptive' | 'manual' | 'supplier';
  isManualSelection?: boolean; // Ajouté pour les sélections manuelles
  
  // Champs pour l'IA explicable
  explanationDetails?: ExplanationDetail[];
  explanationFactors?: ExplanationFactor[];
  explanationSummary?: string;
}

/**
 * Ligne d'écriture comptable 
 */
export interface JournalEntryLine {
  compteCode: string;
  libelleCompte: string;
  montantDebit: number;
  montantCredit: number;
}

/**
 * Structure d'une écriture comptable
 */
export interface JournalEntry {
  date: string;
  libelle: string;
  pieceRef?: string;
  lignes: JournalEntryLine[];
}
