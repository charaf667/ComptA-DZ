/**
 * Données extraites d'un document par OCR
 */
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
  isCorrect: boolean;
  comments?: string;
  extractedData: ExtractedData;
  selectedAccount: {
    compteCode: string;
    libelleCompte: string;
    classe: number;
    scoreConfiance: number;
  };
  corrections?: {
    field: string;
    value: string;
  }[];
}
