/**
 * Données extraites d'un document par OCR
 */
import type { AccountSuggestion } from '../types/accounting';

export interface ExtractedData {
  // Champs originaux (compatibilité avec le code existant)
  date?: string;
  montant?: number;
  tva?: number;
  libelle?: string;
  fournisseur?: string;
  reference?: string;
  confidence: number; // Champ requis pour la compatibilité
  
  // Nouveaux champs avancés
  numeroFacture?: string;
  dateFacture?: string;
  montantHT?: number;
  montantTTC?: number;
  
  // Informations avancées
  dateEcheance?: string;
  conditionsPaiement?: string;
  devise?: string;
  
  // Informations détaillées sur le fournisseur
  fournisseurDetails?: {
    nom?: string;
    adresse?: string;
    telephone?: string;
    email?: string;
    siren?: string;
    siret?: string;
    tvaIntracom?: string;
  };
  
  // Données brutes et métadonnées
  texteComplet?: string;
  confiance?: number;
  type?: 'facture' | 'avoir' | 'devis' | 'bon_livraison' | 'autre';
  documentId?: string;
}

/**
 * Données de feedback de l'utilisateur pour l'apprentissage adaptatif
 */
export interface FeedbackData {
  documentId: string; // ID du document traité
  originalExtractedData: ExtractedData; // Les données OCR complètes utilisées pour la suggestion initiale
  initialAISuggestion: AccountSuggestion | null; // La suggestion initiale de l'IA (peut être null)
  selectedSuggestion: AccountSuggestion | null; // La suggestion finalement sélectionnée par l'utilisateur (peut être null si aucune sélection)
  userCorrection?: string; // Commentaires ou corrections textuelles de l'utilisateur
  decisionTimeMs?: number; // Temps pris par l'utilisateur pour prendre une décision (en millisecondes)
  // Les champs comme 'isCorrect', 'extractedData' (dans le corps du feedback), et 'corrections' détaillées par champ
  // ne sont pas actuellement envoyés par OcrPage.validateAndSave ou explicitement requis par le backend pour le feedback.
  // Ils peuvent être ajoutés ultérieurement si nécessaire.
}
