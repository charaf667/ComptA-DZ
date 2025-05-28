/**
 * Représente une suggestion de compte comptable avec son score de confiance
 */
export interface AccountSuggestion {
  compteCode: string;
  libelleCompte: string;
  classe: number;
  scoreConfiance: number;
  justification: string;
  source?: 'classification' | 'adaptive' | 'manual' | 'supplier';
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
