import { ExtractedData } from './ocr.service';
import adaptiveLearningService from './adaptive-learning.service';

export interface AccountSuggestion {
  compteCode: string;
  libelleCompte: string;
  classe: number;
  scoreConfiance: number;
  justification: string;
}

export class AiClassificationService {
  // Règles de classification basées sur les mots-clés
  private rules = [
    // Charges d'exploitation (classe 6)
    { motCle: 'électricité', compteCode: '6061', libelleCompte: 'Électricité', classe: 6, priorite: 1 },
    { motCle: 'sonelgaz', compteCode: '6061', libelleCompte: 'Électricité', classe: 6, priorite: 1 },
    { motCle: 'eau', compteCode: '6061', libelleCompte: 'Eau', classe: 6, priorite: 1 },
    { motCle: 'téléphone', compteCode: '6262', libelleCompte: 'Téléphone', classe: 6, priorite: 1 },
    { motCle: 'algérie télécom', compteCode: '6262', libelleCompte: 'Téléphone', classe: 6, priorite: 1 },
    { motCle: 'internet', compteCode: '6262', libelleCompte: 'Télécommunications', classe: 6, priorite: 1 },
    { motCle: 'connexion', compteCode: '6262', libelleCompte: 'Télécommunications', classe: 6, priorite: 2 },
    { motCle: 'carburant', compteCode: '6022', libelleCompte: 'Carburant', classe: 6, priorite: 1 },
    { motCle: 'essence', compteCode: '6022', libelleCompte: 'Carburant', classe: 6, priorite: 1 },
    { motCle: 'gazole', compteCode: '6022', libelleCompte: 'Carburant', classe: 6, priorite: 1 },
    { motCle: 'diesel', compteCode: '6022', libelleCompte: 'Carburant', classe: 6, priorite: 1 },
    { motCle: 'loyer', compteCode: '6132', libelleCompte: 'Locations immobilières', classe: 6, priorite: 1 },
    { motCle: 'location', compteCode: '6132', libelleCompte: 'Locations immobilières', classe: 6, priorite: 2 },
    { motCle: 'fourniture', compteCode: '6064', libelleCompte: 'Fournitures administratives', classe: 6, priorite: 2 },
    { motCle: 'papeterie', compteCode: '6064', libelleCompte: 'Fournitures administratives', classe: 6, priorite: 2 },
    { motCle: 'bureau', compteCode: '6064', libelleCompte: 'Fournitures administratives', classe: 6, priorite: 3 },
    { motCle: 'ordinateur', compteCode: '6064', libelleCompte: 'Fournitures administratives', classe: 6, priorite: 2 },
    { motCle: 'imprimante', compteCode: '6064', libelleCompte: 'Fournitures administratives', classe: 6, priorite: 2 },
    { motCle: 'toner', compteCode: '6064', libelleCompte: 'Fournitures administratives', classe: 6, priorite: 2 },
    { motCle: 'cartouche', compteCode: '6064', libelleCompte: 'Fournitures administratives', classe: 6, priorite: 2 },
    { motCle: 'honoraire', compteCode: '6226', libelleCompte: 'Honoraires', classe: 6, priorite: 1 },
    { motCle: 'avocat', compteCode: '6226', libelleCompte: 'Honoraires', classe: 6, priorite: 2 },
    { motCle: 'comptable', compteCode: '6226', libelleCompte: 'Honoraires', classe: 6, priorite: 2 },
    { motCle: 'consultant', compteCode: '6226', libelleCompte: 'Honoraires', classe: 6, priorite: 2 },
    { motCle: 'maintenance', compteCode: '6156', libelleCompte: 'Maintenance', classe: 6, priorite: 1 },
    { motCle: 'réparation', compteCode: '6156', libelleCompte: 'Maintenance', classe: 6, priorite: 1 },
    { motCle: 'entretien', compteCode: '6156', libelleCompte: 'Maintenance', classe: 6, priorite: 2 },
    { motCle: 'assurance', compteCode: '6160', libelleCompte: 'Primes d\'assurance', classe: 6, priorite: 1 },
    { motCle: 'police', compteCode: '6160', libelleCompte: 'Primes d\'assurance', classe: 6, priorite: 2 },
    { motCle: 'publicité', compteCode: '6231', libelleCompte: 'Publicité', classe: 6, priorite: 1 },
    { motCle: 'marketing', compteCode: '6231', libelleCompte: 'Publicité', classe: 6, priorite: 1 },
    { motCle: 'annonce', compteCode: '6231', libelleCompte: 'Publicité', classe: 6, priorite: 2 },
    { motCle: 'formation', compteCode: '6183', libelleCompte: 'Formation du personnel', classe: 6, priorite: 1 },
    { motCle: 'stage', compteCode: '6183', libelleCompte: 'Formation du personnel', classe: 6, priorite: 2 },
    { motCle: 'voyage', compteCode: '6251', libelleCompte: 'Voyages et déplacements', classe: 6, priorite: 1 },
    { motCle: 'déplacement', compteCode: '6251', libelleCompte: 'Voyages et déplacements', classe: 6, priorite: 1 },
    { motCle: 'hôtel', compteCode: '6251', libelleCompte: 'Voyages et déplacements', classe: 6, priorite: 2 },
    { motCle: 'billet', compteCode: '6251', libelleCompte: 'Voyages et déplacements', classe: 6, priorite: 2 },
    { motCle: 'avion', compteCode: '6251', libelleCompte: 'Voyages et déplacements', classe: 6, priorite: 3 },
    
    // Produits d'exploitation (classe 7)
    { motCle: 'vente', compteCode: '7011', libelleCompte: 'Ventes de produits finis', classe: 7, priorite: 1 },
    { motCle: 'produit', compteCode: '7011', libelleCompte: 'Ventes de produits finis', classe: 7, priorite: 2 },
    { motCle: 'marchandise', compteCode: '7011', libelleCompte: 'Ventes de produits finis', classe: 7, priorite: 2 },
    { motCle: 'prestation', compteCode: '7061', libelleCompte: 'Prestations de services', classe: 7, priorite: 1 },
    { motCle: 'service', compteCode: '7061', libelleCompte: 'Prestations de services', classe: 7, priorite: 1 },
    { motCle: 'consultation', compteCode: '7061', libelleCompte: 'Prestations de services', classe: 7, priorite: 2 },
    { motCle: 'conseil', compteCode: '7061', libelleCompte: 'Prestations de services', classe: 7, priorite: 2 },
  ];
  
  // Règles de classification basées sur les noms de fournisseurs
  private fournisseurRules = [
    { nom: 'sonelgaz', compteCode: '6061', libelleCompte: 'Électricité', classe: 6, priorite: 1 },
    { nom: 'seaal', compteCode: '6061', libelleCompte: 'Eau', classe: 6, priorite: 1 },
    { nom: 'algérie télécom', compteCode: '6262', libelleCompte: 'Téléphone', classe: 6, priorite: 1 },
    { nom: 'djezzy', compteCode: '6262', libelleCompte: 'Téléphone', classe: 6, priorite: 1 },
    { nom: 'ooredoo', compteCode: '6262', libelleCompte: 'Téléphone', classe: 6, priorite: 1 },
    { nom: 'mobilis', compteCode: '6262', libelleCompte: 'Téléphone', classe: 6, priorite: 1 },
    { nom: 'naftal', compteCode: '6022', libelleCompte: 'Carburant', classe: 6, priorite: 1 },
    { nom: 'alpha', compteCode: '6064', libelleCompte: 'Fournitures administratives', classe: 6, priorite: 2 },
    { nom: 'société alpha', compteCode: '6064', libelleCompte: 'Fournitures administratives', classe: 6, priorite: 2 },
  ];
  
  // Règles de classification basées sur les références
  private referenceRules = [
    { pattern: /^F-\d+$/, compteCode: '6064', libelleCompte: 'Fournitures administratives', classe: 6, priorite: 2 },
    { pattern: /^FAC-\d+$/, compteCode: '6064', libelleCompte: 'Fournitures administratives', classe: 6, priorite: 2 },
    { pattern: /^INV-\d+$/, compteCode: '6064', libelleCompte: 'Fournitures administratives', classe: 6, priorite: 2 },
  ];

  /**
   * Suggère des comptes basés sur un libellé ou texte
   * @param libelle Le texte à analyser
   * @returns Liste de suggestions de comptes
   */
  public suggestAccount(libelle: string): AccountSuggestion[] {
    if (!libelle) return [];
    const suggestions: AccountSuggestion[] = [];
    const libelleLower = libelle.toLowerCase();
    
    // Recherche par mots-clés
    for (const rule of this.rules) {
      if (libelleLower.includes(rule.motCle.toLowerCase())) {
        // Calcul du score de confiance basé sur la priorité
        let scoreConfiance = 0;
        switch (rule.priorite) {
          case 1: scoreConfiance = 0.95; break;
          case 2: scoreConfiance = 0.85; break;
          case 3: scoreConfiance = 0.75; break;
          default: scoreConfiance = 0.65;
        }
        
        suggestions.push({
          compteCode: rule.compteCode,
          libelleCompte: rule.libelleCompte,
          classe: rule.classe,
          scoreConfiance,
          justification: `Correspondance mot-clé: ${rule.motCle}`
        });
      }
    }
    
    // Déduplique les suggestions en gardant celle avec le score le plus élevé
    const uniqueSuggestions = this.deduplicateSuggestions(suggestions);
    
    return uniqueSuggestions
      .sort((a, b) => b.scoreConfiance - a.scoreConfiance)
      .slice(0, 3);
  }
  
  /**
   * Suggère des comptes basés sur le nom du fournisseur
   * @param fournisseur Le nom du fournisseur
   * @returns Liste de suggestions de comptes
   */
  public suggestAccountByFournisseur(fournisseur: string): AccountSuggestion[] {
    if (!fournisseur) return [];
    const suggestions: AccountSuggestion[] = [];
    const fournisseurLower = fournisseur.toLowerCase();
    
    for (const rule of this.fournisseurRules) {
      if (fournisseurLower.includes(rule.nom.toLowerCase())) {
        // Calcul du score de confiance basé sur la priorité
        let scoreConfiance = 0;
        switch (rule.priorite) {
          case 1: scoreConfiance = 0.98; break; // Score plus élevé pour les fournisseurs
          case 2: scoreConfiance = 0.90; break;
          default: scoreConfiance = 0.80;
        }
        
        suggestions.push({
          compteCode: rule.compteCode,
          libelleCompte: rule.libelleCompte,
          classe: rule.classe,
          scoreConfiance,
          justification: `Fournisseur identifié: ${rule.nom}`
        });
      }
    }
    
    return suggestions;
  }
  
  /**
   * Suggère des comptes basés sur la référence de la facture
   * @param reference La référence de la facture
   * @returns Liste de suggestions de comptes
   */
  public suggestAccountByReference(reference: string): AccountSuggestion[] {
    if (!reference) return [];
    const suggestions: AccountSuggestion[] = [];
    
    for (const rule of this.referenceRules) {
      if (rule.pattern.test(reference)) {
        // Score fixe pour les références
        const scoreConfiance = 0.85;
        
        suggestions.push({
          compteCode: rule.compteCode,
          libelleCompte: rule.libelleCompte,
          classe: rule.classe,
          scoreConfiance,
          justification: `Format de référence reconnu: ${reference}`
        });
      }
    }
    
    return suggestions;
  }
  
  /**
   * Déduplique les suggestions en conservant celle avec le score le plus élevé
   * @param suggestions Liste de suggestions à dédupliquer
   * @returns Liste dédupliquée
   */
  private deduplicateSuggestions(suggestions: AccountSuggestion[]): AccountSuggestion[] {
    const uniqueMap = new Map<string, AccountSuggestion>();
    
    for (const suggestion of suggestions) {
      const key = suggestion.compteCode;
      if (!uniqueMap.has(key) || uniqueMap.get(key)!.scoreConfiance < suggestion.scoreConfiance) {
        uniqueMap.set(key, suggestion);
      }
    }
    
    return Array.from(uniqueMap.values());
  }

  /**
   * Classifie un document en fonction des données extraites et suggère des comptes appropriés
   * @param extractedData Données extraites du document
   * @returns Suggestions de comptes et écriture comptable proposée
   */
  public classifyDocument(extractedData: ExtractedData): {
    suggestions: AccountSuggestion[],
    ecritureProposee: any
  } {
    let allSuggestions: AccountSuggestion[] = [];
    
    // 1. Suggérer des comptes basés sur le libellé
    if (extractedData.libelle) {
      const libelleSuggestions = this.suggestAccount(extractedData.libelle);
      allSuggestions = [...allSuggestions, ...libelleSuggestions];
    }
    
    // 2. Suggérer des comptes basés sur le fournisseur (plus fiable)
    if (extractedData.fournisseur) {
      const fournisseurSuggestions = this.suggestAccountByFournisseur(extractedData.fournisseur);
      allSuggestions = [...allSuggestions, ...fournisseurSuggestions];
    }
    
    // 3. Suggérer des comptes basés sur la référence
    if (extractedData.reference) {
      const referenceSuggestions = this.suggestAccountByReference(extractedData.reference);
      allSuggestions = [...allSuggestions, ...referenceSuggestions];
    }
    
    // 4. Utiliser le montant comme indice supplémentaire
    // Si le montant est élevé (> 10000 DZD), c'est peut-être un investissement
    if (extractedData.montant && extractedData.montant > 10000) {
      allSuggestions.push({
        compteCode: '2154',
        libelleCompte: 'Matériel de bureau et informatique',
        classe: 2,
        scoreConfiance: 0.60,
        justification: 'Montant élevé suggérant un possible investissement'
      });
    }
    
    // 5. NOUVEAU: Intégrer les suggestions de l'apprentissage adaptatif
    try {
      const adaptiveSuggestions = adaptiveLearningService.suggestAccounts(extractedData);
      if (adaptiveSuggestions.length > 0) {
        console.log(`Suggestions adaptatives: ${adaptiveSuggestions.length} trouvées`);
        // Les suggestions adaptatives ont une priorité plus élevée car elles sont basées sur l'historique
        allSuggestions = [...adaptiveSuggestions, ...allSuggestions];
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions adaptatives:', error);
    }
    
    // Dédupliquer les suggestions et trier par score de confiance
    const uniqueSuggestions = this.deduplicateSuggestions(allSuggestions)
      .sort((a, b) => b.scoreConfiance - a.scoreConfiance)
      .slice(0, 3); // Limiter à 3 suggestions
    
    // Générer l'écriture comptable proposée basée sur la meilleure suggestion
    const ecritureProposee = this.generateJournalEntry(extractedData, uniqueSuggestions[0]);
    
    // Journaliser les résultats pour le débogage
    console.log(`Classification document: ${extractedData.fournisseur || 'Inconnu'} - ${extractedData.montant || 0} DZD`);
    console.log(`Suggestions: ${uniqueSuggestions.length > 0 ? uniqueSuggestions[0].compteCode : 'Aucune'}`);
    
    return {
      suggestions: uniqueSuggestions,
      ecritureProposee
    };
  }
  
  /**
   * Enregistre le feedback de l'utilisateur pour améliorer les suggestions futures
   * @param extractedData Données extraites du document
   * @param selectedAccount Compte sélectionné par l'utilisateur
   */
  public recordUserFeedback(extractedData: ExtractedData, selectedAccount: AccountSuggestion): void {
    try {
      // Enregistrer le feedback dans le service d'apprentissage adaptatif
      adaptiveLearningService.recordFeedback(extractedData, selectedAccount);
      console.log(`Feedback enregistré pour le compte ${selectedAccount.compteCode}`);
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du feedback:', error);
    }
  }

  private generateJournalEntry(data: ExtractedData, suggestion?: AccountSuggestion) {
    if (!data.montant || !suggestion) return null;
    const montantHT = data.tva ? data.montant - data.tva : data.montant;
    if (suggestion.classe === 6) {
      return {
        date: data.date || new Date().toISOString().split('T')[0],
        libelle: data.libelle || `Facture ${data.fournisseur || ''}`,
        lignes: [
          {
            compteCode: suggestion.compteCode,
            libelleCompte: suggestion.libelleCompte,
            montantDebit: montantHT,
            montantCredit: 0
          },
          data.tva ? {
            compteCode: '4456',
            libelleCompte: 'TVA déductible',
            montantDebit: data.tva,
            montantCredit: 0
          } : null,
          {
            compteCode: '401',
            libelleCompte: 'Fournisseurs',
            montantDebit: 0,
            montantCredit: data.montant
          }
        ].filter(Boolean)
      };
    } else if (suggestion.classe === 7) {
      return {
        date: data.date || new Date().toISOString().split('T')[0],
        libelle: data.libelle || `Facture client`,
        lignes: [
          {
            compteCode: '411',
            libelleCompte: 'Clients',
            montantDebit: data.montant,
            montantCredit: 0
          },
          {
            compteCode: suggestion.compteCode,
            libelleCompte: suggestion.libelleCompte,
            montantDebit: 0,
            montantCredit: montantHT
          },
          data.tva ? {
            compteCode: '4457',
            libelleCompte: 'TVA collectée',
            montantDebit: 0,
            montantCredit: data.tva
          } : null
        ].filter(Boolean)
      };
    }
    return null;
  }
}

export default new AiClassificationService();
