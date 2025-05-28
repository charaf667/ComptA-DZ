import fs from 'fs';
import path from 'path';
import { ExtractedData } from './ocr.service';
import { AccountSuggestion } from './ai-classification.service';

interface UserFeedback {
  extractedData: ExtractedData;
  selectedAccount: AccountSuggestion;
  timestamp: string;
  confidence: number;
}

interface LearningPattern {
  pattern: string;
  accountCode: string;
  occurrences: number;
  lastUsed: string;
  confidence: number;
}

/**
 * Service d'apprentissage adaptatif pour améliorer les suggestions de classification
 * au fil du temps en fonction des choix de l'utilisateur
 */
export class AdaptiveLearningService {
  private dataPath: string;
  private patterns: LearningPattern[] = [];
  private readonly CONFIDENCE_THRESHOLD = 0.75;
  private readonly MIN_OCCURRENCES = 2;

  constructor() {
    this.dataPath = path.join(__dirname, '..', '..', 'data', 'learning-patterns.json');
    this.loadPatterns();
  }

  /**
   * Charge les patterns d'apprentissage depuis le fichier
   */
  private loadPatterns(): void {
    try {
      // Créer le dossier data s'il n'existe pas
      const dataDir = path.dirname(this.dataPath);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Charger les patterns s'ils existent
      if (fs.existsSync(this.dataPath)) {
        const data = fs.readFileSync(this.dataPath, 'utf8');
        this.patterns = JSON.parse(data);
        console.log(`Patterns d'apprentissage chargés: ${this.patterns.length}`);
      } else {
        // Créer un fichier vide si inexistant
        this.patterns = [];
        fs.writeFileSync(this.dataPath, JSON.stringify(this.patterns, null, 2));
        console.log('Fichier de patterns d\'apprentissage créé');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des patterns:', error);
      this.patterns = [];
    }
  }

  /**
   * Sauvegarde les patterns d'apprentissage dans le fichier
   */
  private savePatterns(): void {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(this.patterns, null, 2));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des patterns:', error);
    }
  }

  /**
   * Enregistre le feedback de l'utilisateur pour améliorer les suggestions futures
   * @param data Données extraites du document
   * @param selectedAccount Compte sélectionné par l'utilisateur
   */
  public recordFeedback(data: ExtractedData, selectedAccount: AccountSuggestion): void {
    if (!data || !selectedAccount) return;

    const feedback: UserFeedback = {
      extractedData: data,
      selectedAccount,
      timestamp: new Date().toISOString(),
      confidence: selectedAccount.scoreConfiance || 0.5
    };

    console.log(`Enregistrement du feedback: ${selectedAccount.compteCode} pour ${data.fournisseur || 'inconnu'}`);

    // Extraire et enregistrer les patterns
    this.extractAndSavePatterns(feedback);
  }

  /**
   * Extrait les patterns d'apprentissage à partir du feedback utilisateur
   * @param feedback Feedback de l'utilisateur
   */
  private extractAndSavePatterns(feedback: UserFeedback): void {
    const { extractedData, selectedAccount } = feedback;
    const accountCode = selectedAccount.compteCode;
    const now = new Date().toISOString();

    // Patterns basés sur le fournisseur
    if (extractedData.fournisseur) {
      this.updatePattern(extractedData.fournisseur.toLowerCase(), accountCode, now, 0.9);
    }

    // Patterns basés sur le libellé
    if (extractedData.libelle) {
      // Extraire les mots-clés du libellé (mots de plus de 3 caractères)
      const keywords = extractedData.libelle.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3);
      
      for (const keyword of keywords) {
        this.updatePattern(keyword, accountCode, now, 0.7);
      }
    }

    // Patterns basés sur la référence
    if (extractedData.reference) {
      // Extraire le format de référence (ex: F-12345 -> F-#####)
      const refFormat = extractedData.reference.replace(/\d+/g, '#');
      this.updatePattern(refFormat, accountCode, now, 0.8);
    }

    // Sauvegarder les patterns mis à jour
    this.savePatterns();
  }

  /**
   * Met à jour un pattern existant ou en crée un nouveau
   * @param pattern Motif à mettre à jour
   * @param accountCode Code de compte associé
   * @param timestamp Horodatage de l'utilisation
   * @param baseConfidence Confiance de base pour ce type de pattern
   */
  private updatePattern(pattern: string, accountCode: string, timestamp: string, baseConfidence: number): void {
    // Rechercher un pattern existant
    const existingPattern = this.patterns.find(p => 
      p.pattern.toLowerCase() === pattern.toLowerCase() && 
      p.accountCode === accountCode
    );

    if (existingPattern) {
      // Mettre à jour le pattern existant
      existingPattern.occurrences += 1;
      existingPattern.lastUsed = timestamp;
      // Augmenter la confiance avec chaque occurrence, mais plafonner à 0.98
      existingPattern.confidence = Math.min(
        baseConfidence + (0.05 * Math.log(existingPattern.occurrences)),
        0.98
      );
    } else {
      // Créer un nouveau pattern
      this.patterns.push({
        pattern,
        accountCode,
        occurrences: 1,
        lastUsed: timestamp,
        confidence: baseConfidence
      });
    }
  }

  /**
   * Suggère des comptes basés sur les patterns d'apprentissage
   * @param data Données extraites du document
   * @returns Liste de suggestions de comptes
   */
  public suggestAccounts(data: ExtractedData): AccountSuggestion[] {
    if (!data) return [];
    
    const suggestions: AccountSuggestion[] = [];
    const matchedPatterns: Map<string, { confidence: number, pattern: string }> = new Map();

    // Vérifier les correspondances avec le fournisseur
    if (data.fournisseur) {
      this.findMatchingPatterns(data.fournisseur.toLowerCase(), matchedPatterns);
    }

    // Vérifier les correspondances avec le libellé
    if (data.libelle) {
      const keywords = data.libelle.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3);
      
      for (const keyword of keywords) {
        this.findMatchingPatterns(keyword, matchedPatterns);
      }
    }

    // Vérifier les correspondances avec la référence
    if (data.reference) {
      const refFormat = data.reference.replace(/\d+/g, '#');
      this.findMatchingPatterns(refFormat, matchedPatterns);
    }

    // Convertir les correspondances en suggestions
    for (const [accountCode, match] of matchedPatterns.entries()) {
      if (match.confidence >= this.CONFIDENCE_THRESHOLD) {
        suggestions.push({
          compteCode: accountCode,
          libelleCompte: this.getAccountLabel(accountCode),
          classe: parseInt(accountCode.charAt(0)),
          scoreConfiance: match.confidence,
          justification: `Apprentissage: "${match.pattern}"`
        });
      }
    }

    return suggestions.sort((a, b) => b.scoreConfiance - a.scoreConfiance);
  }

  /**
   * Trouve les patterns correspondants aux données et met à jour la map des correspondances
   * @param text Texte à analyser
   * @param matchedPatterns Map des correspondances à mettre à jour
   */
  private findMatchingPatterns(text: string, matchedPatterns: Map<string, { confidence: number, pattern: string }>): void {
    const textLower = text.toLowerCase();
    
    for (const pattern of this.patterns) {
      // Ne considérer que les patterns avec suffisamment d'occurrences
      if (pattern.occurrences < this.MIN_OCCURRENCES) continue;
      
      if (textLower.includes(pattern.pattern.toLowerCase())) {
        // Si on a déjà une correspondance pour ce compte, prendre celle avec la confiance la plus élevée
        const existing = matchedPatterns.get(pattern.accountCode);
        if (!existing || existing.confidence < pattern.confidence) {
          matchedPatterns.set(pattern.accountCode, { 
            confidence: pattern.confidence,
            pattern: pattern.pattern
          });
        }
      }
    }
  }

  /**
   * Obtient le libellé d'un compte à partir de son code
   * @param accountCode Code du compte
   * @returns Libellé du compte
   */
  private getAccountLabel(accountCode: string): string {
    // Mapping simplifié des codes de compte vers les libellés
    const accountLabels: Record<string, string> = {
      '2154': 'Matériel de bureau et informatique',
      '401': 'Fournisseurs',
      '411': 'Clients',
      '4456': 'TVA déductible',
      '4457': 'TVA collectée',
      '6022': 'Carburant',
      '6061': 'Électricité',
      '6064': 'Fournitures administratives',
      '6132': 'Locations immobilières',
      '6156': 'Maintenance',
      '6160': 'Primes d\'assurance',
      '6183': 'Formation du personnel',
      '6226': 'Honoraires',
      '6231': 'Publicité',
      '6251': 'Voyages et déplacements',
      '6262': 'Téléphone',
      '7011': 'Ventes de produits finis',
      '7061': 'Prestations de services'
    };

    return accountLabels[accountCode] || `Compte ${accountCode}`;
  }
}

export default new AdaptiveLearningService();
