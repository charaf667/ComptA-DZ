/**
 * Types pour l'IA explicable
 * Ces types définissent la structure des explications fournies par le système d'IA
 */

/**
 * Représente un facteur individuel qui a contribué à une décision d'IA
 */
export interface ExplanationFactor {
  /** Nom du facteur (ex: "Mot-clé", "Position", "Priorité") */
  factor: string;
  
  /** Valeur du facteur (ex: "facture", "début", "1") */
  value: string;
  
  /** Impact du facteur sur la décision finale (0.0 à 1.0) */
  impact: number;
  
  /** Description textuelle de l'impact de ce facteur */
  description: string;
}

/**
 * Représente un détail d'explication pour une suggestion d'IA
 */
export interface ExplanationDetail {
  /** Titre du détail d'explication */
  title: string;
  
  /** Description détaillée */
  description: string;
  
  /** Niveau de confiance pour ce détail (0-100) */
  confidence: number;
}

/**
 * Métriques pour évaluer l'efficacité des explications d'IA
 */
export interface ExplanationMetrics {
  /** L'explication a-t-elle été utile pour l'utilisateur? */
  isHelpful: boolean;
  
  /** Type d'explication (général, détaillé, facteurs, etc.) */
  explanationType: string;
  
  /** La suggestion associée à cette explication a-t-elle été acceptée? */
  suggestionAccepted: boolean;
  
  /** Commentaires optionnels de l'utilisateur */
  comments?: string;
}
