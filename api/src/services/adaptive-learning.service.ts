import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as fs from 'fs-extra';
import * as path from 'path';
import { ExtractedData } from './ocr.service';
import { AccountSuggestion } from './ai-classification.service';
import { ExplanationMetrics } from '../types/explanation';
import prisma from '../config/prisma';
import { Prisma } from '@prisma/client';
import accountRepo from '../repositories/account.repository';

export interface UserFeedback {
  extractedData: ExtractedData;
  selectedAccount: AccountSuggestion;
  timestamp: string;
  confidence: number;
}

export interface LearningPattern {
  pattern: string;
  accountId: string;
  accountCode: string;
  occurrences: number;
  confidence: number;
  lastUsed: Date;
}

export interface PerformanceMetrics {
  totalSuggestions: number;
  acceptedSuggestions: number;
  rejectedSuggestions: number;
  averageDecisionTimeMs: number;
  lastUpdated: string;
  explanations: {
    total: number;
    helpful: number;
    notHelpful: number;
    byType: Record<string, {
      total: number;
      helpful: number;
      notHelpful: number;
      acceptanceRate: number;
    }>;
  };
}

/**
 * Service d'apprentissage adaptatif pour améliorer les suggestions de classification
 * au fil du temps en fonction des choix de l'utilisateur
 */
export class AdaptiveLearningService {
  private readonly CONFIDENCE_THRESHOLD = 0.75;
  private readonly MIN_OCCURRENCES = 2;

  /**
   * Charge les patterns d'apprentissage depuis la base de données
   */
  public async loadPatterns(tenantId: string): Promise<LearningPattern[]> {
    try {
      if (!tenantId) {
        console.warn('Tentative de chargement des patterns sans tenantId.');
        return [];
      }

      const tenantPatterns = await prisma.$queryRaw`
        SELECT p.*, a."code" as "accountCode" FROM "learning_patterns" p 
        LEFT JOIN "accounts" a ON p."accountId" = a."id"
        WHERE p."tenantId" = ${tenantId}
      `;
      
      return (tenantPatterns as any[]).map((p: any) => ({
        pattern: p.pattern,
        accountId: p.accountId,
        accountCode: p.accountCode,
        occurrences: p.occurrences,
        confidence: p.confidence,
        lastUsed: p.lastUsed
      }));
    } catch (dbError) {
      // Si la table n'existe pas encore, charger depuis le fichier JSON pour la migration
      console.log('Chargement depuis les fichiers JSON pour la migration...', dbError);
      const dataPath = path.join(__dirname, '..', '..', 'data', 'learning-patterns.json');
      if (fs.existsSync(dataPath)) {
        const data = fs.readFileSync(dataPath, 'utf8');
        return JSON.parse(data);
      } else {
        return [];
      }
    }
  }

  /**
   * Sauvegarde un pattern d'apprentissage dans la base de données
   * @param pattern Le pattern à sauvegarder
   * @param tenantId ID du tenant pour lequel sauvegarder le pattern
   */
  private async savePattern(pattern: LearningPattern, tenantId: string): Promise<void> {
    try {
      if (!tenantId) {
        console.error('Impossible de sauvegarder le pattern: aucun tenantId fourni.');
        return;
      }
      
      // Rechercher si le pattern existe déjà pour ce tenant
      const existingPatterns = await prisma.$queryRaw`
        SELECT * FROM "learning_patterns" 
        WHERE "tenantId" = ${tenantId} 
        AND "pattern" = ${pattern.pattern} 
        AND "accountId" = ${pattern.accountId}
      `;
      
      const existingDbPattern = (existingPatterns as any[])[0];
      
      // Utiliser des requêtes SQL brutes pour contourner les problèmes de type
      if (existingDbPattern) {
        // Mettre à jour un pattern existant
        await prisma.$executeRaw`
          UPDATE "learning_patterns" 
          SET 
            "occurrences" = ${pattern.occurrences}, 
            "confidence" = ${pattern.confidence}, 
            "lastUsed" = ${new Date()}
          WHERE "id" = ${existingDbPattern.id}
        `;
      } else {
        // Créer un nouveau pattern
        await prisma.$executeRaw`
          INSERT INTO "learning_patterns" (
            "id", "tenantId", "pattern", "accountId", "accountCode", 
            "occurrences", "confidence", "lastUsed", "createdAt"
          ) VALUES (
            ${randomUUID()}, 
            ${tenantId}, 
            ${pattern.pattern}, 
            ${pattern.accountId}, 
            ${pattern.accountCode}, 
            ${pattern.occurrences}, 
            ${pattern.confidence}, 
            ${new Date()}, 
            ${new Date()}
          )
        `;
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du pattern dans la base de données:', error);
    }
  }

  /**
   * Charge les métriques de performance depuis la base de données
   * @param tenantId ID du tenant pour lequel charger les métriques
   * @returns Les métriques de performance chargées
   */
  /**
   * Initialise les métriques de performance avec des valeurs par défaut
   * @returns Métriques de performance par défaut
   */
  private initializePerformanceMetrics(): PerformanceMetrics {
    return {
      totalSuggestions: 0,
      acceptedSuggestions: 0,
      rejectedSuggestions: 0,
      averageDecisionTimeMs: 0,
      lastUpdated: new Date().toISOString(),
      explanations: {
        total: 0,
        helpful: 0,
        notHelpful: 0,
        byType: {}
      }
    };
  }

  /**
   * Recherche un pattern d'apprentissage spécifique
   * @param tenantId ID du tenant pour lequel rechercher le pattern
   * @param patternText Texte du pattern à rechercher
   * @param accountCode Code du compte associé au pattern
   * @returns Le pattern s'il existe, null sinon
   */
  private async findPatternByText(tenantId: string, patternText: string, accountCode: string): Promise<LearningPattern | null> {
    // Charger tous les patterns du tenant
    const patterns = await this.loadPatterns(tenantId);
    
    // Rechercher un pattern correspondant au texte et au code de compte
    const foundPattern = patterns.find(p => 
      p.pattern.toLowerCase() === patternText.toLowerCase() && 
      p.accountCode === accountCode
    );
    
    return foundPattern || null;
  }

  /**
   * Charge les métriques de performance depuis la base de données
   * @param tenantId ID du tenant pour lequel charger les métriques
   * @returns Les métriques de performance chargées
   */
  private async loadPerformanceMetrics(tenantId: string): Promise<PerformanceMetrics> {
    try {
      if (!tenantId) {
        console.log('Aucun tenant défini pour charger les métriques de performance');
        return this.initializePerformanceMetrics();
      }

      try {
        // Rechercher les métriques pour le tenant actuel
        const tenantMetrics = await prisma.$queryRaw`
          SELECT * FROM "tenant_performance_metrics" 
          WHERE "tenantId" = ${tenantId}
        `;
        
        const metricsResult = tenantMetrics as any[];
        
        if (metricsResult && metricsResult.length > 0) {
          const tenantMetricsData = metricsResult[0];
          // Convertir les données JSON en objet PerformanceMetrics
          return {
            totalSuggestions: tenantMetricsData.totalSuggestions,
            acceptedSuggestions: tenantMetricsData.acceptedSuggestions,
            rejectedSuggestions: tenantMetricsData.rejectedSuggestions,
            averageDecisionTimeMs: tenantMetricsData.averageDecisionTimeMs,
            lastUpdated: tenantMetricsData.updatedAt.toISOString(),
            explanations: tenantMetricsData.explanationsData as any
          };
        } else {
          // Créer des métriques par défaut si elles n'existent pas
          await this.savePerformanceMetrics(tenantId);
          console.log('Métriques de performance initialisées pour le tenant');
          return this.loadPerformanceMetrics(tenantId);
        }
      } catch (dbError) {
        // Fallback vers le fichier JSON pour la rétrocompatibilité
        console.log('Chargement des métriques depuis le fichier JSON (rétrocompatibilité):', dbError);
        const metricsPath = path.join(__dirname, '..', '..', 'data', 'performance-metrics.json');
        
        if (fs.existsSync(metricsPath)) {
          const data = fs.readFileSync(metricsPath, 'utf8');
          return JSON.parse(data);
        } else {
          return this.initializePerformanceMetrics();
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des métriques de performance:', error);
      return this.initializePerformanceMetrics();
    }
  }

  /**
   * Sauvegarde les métriques de performance dans la base de données
   * @param tenantId ID du tenant pour lequel sauvegarder les métriques
   * @param metrics Métriques à sauvegarder
   */
  private async savePerformanceMetrics(tenantId: string, metrics?: PerformanceMetrics): Promise<void> {
    try {
      if (!tenantId) {
        console.error('Impossible de sauvegarder les métriques: aucun tenant défini');
        return;
      }

      const metricsToSave = metrics || this.initializePerformanceMetrics();
      
      // Mettre à jour la date de dernière modification
      metricsToSave.lastUpdated = new Date().toISOString();

      try {
        // Vérifier si les métriques existent déjà
        const existingMetrics = await prisma.$queryRaw`
          SELECT * FROM "tenant_performance_metrics" 
          WHERE "tenantId" = ${tenantId}
        `;
        
        const metricsExist = (existingMetrics as any[]).length > 0;
        
        if (metricsExist) {
          // Mettre à jour les métriques existantes
          await prisma.$executeRaw`
            UPDATE "tenant_performance_metrics" 
            SET 
              "totalSuggestions" = ${metricsToSave.totalSuggestions},
              "acceptedSuggestions" = ${metricsToSave.acceptedSuggestions},
              "rejectedSuggestions" = ${metricsToSave.rejectedSuggestions},
              "averageDecisionTimeMs" = ${metricsToSave.averageDecisionTimeMs},
              "explanationsData" = ${JSON.stringify(metricsToSave.explanations)}::jsonb,
              "updatedAt" = ${new Date()}
            WHERE "tenantId" = ${tenantId}
          `;
        } else {
          // Créer de nouvelles métriques
          await prisma.$executeRaw`
            INSERT INTO "tenant_performance_metrics" (
              "id",
              "tenantId", 
              "totalSuggestions", 
              "acceptedSuggestions", 
              "rejectedSuggestions", 
              "averageDecisionTimeMs", 
              "explanationsData", 
              "createdAt", 
              "updatedAt"
            ) VALUES (
              ${randomUUID()},
              ${tenantId},
              ${metricsToSave.totalSuggestions},
              ${metricsToSave.acceptedSuggestions},
              ${metricsToSave.rejectedSuggestions},
              ${metricsToSave.averageDecisionTimeMs},
              ${JSON.stringify(metricsToSave.explanations)},
              ${new Date()},
              ${new Date()}
            )
          `;
        }
      } catch (dbError) {
        // Fallback vers le fichier JSON pour la rétrocompatibilité
        console.log('Sauvegarde des métriques dans le fichier JSON (rétrocompatibilité):', dbError);
        const metricsPath = path.join(__dirname, '..', '..', 'data', 'performance-metrics.json');
        const dataDir = path.dirname(metricsPath);
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }
        fs.writeFileSync(metricsPath, JSON.stringify(metricsToSave, null, 2));
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des métriques de performance:', error);
    }
  }

  /**
   * Met à jour les métriques de performance en fonction du feedback utilisateur
   * @param tenantId ID du tenant pour lequel mettre à jour les métriques
   * @param isAccepted Si la suggestion a été acceptée
   * @param decisionTime Temps pris pour la décision en ms
   * @returns Les métriques de performance mises à jour
   */
  public async updatePerformanceMetrics(tenantId: string, isAccepted: boolean, decisionTime?: number): Promise<PerformanceMetrics> {
    // Charger les métriques actuelles
    const performanceMetrics = await this.loadPerformanceMetrics(tenantId);
    
    // Incrémenter le nombre total de suggestions
    performanceMetrics.totalSuggestions += 1;
    
    // Incrémenter le nombre de suggestions acceptées ou rejetées
    if (isAccepted) {
      performanceMetrics.acceptedSuggestions += 1;
    } else {
      performanceMetrics.rejectedSuggestions += 1;
    }
    
    // Mettre à jour le temps moyen de décision si fourni
    if (decisionTime) {
      const currentTotal = performanceMetrics.averageDecisionTimeMs * (performanceMetrics.totalSuggestions - 1);
      performanceMetrics.averageDecisionTimeMs = 
        (currentTotal + decisionTime) / performanceMetrics.totalSuggestions;
    }
    
    // Mettre à jour la date de dernière modification
    performanceMetrics.lastUpdated = new Date().toISOString();
    
    // Sauvegarder les métriques mises à jour
    await this.savePerformanceMetrics(tenantId, performanceMetrics);
    
    return performanceMetrics;
  }

  /**
   * Met à jour les métriques relatives aux explications fournies par l'IA
   * @param tenantId ID du tenant pour lequel mettre à jour les métriques
   * @param explanationMetrics Métriques d'explication à enregistrer
   * @returns Les métriques de performance mises à jour
   */
  public async updateExplanationMetrics(tenantId: string, explanationMetrics: ExplanationMetrics): Promise<PerformanceMetrics> {
    try {
      // Charger les métriques actuelles
      const performanceMetrics = await this.loadPerformanceMetrics(tenantId);
      
      // Mise à jour des compteurs globaux
      performanceMetrics.explanations.total++;
      if (explanationMetrics.isHelpful) {
        performanceMetrics.explanations.helpful++;
      } else {
        performanceMetrics.explanations.notHelpful++;
      }
      
      // Mise à jour des compteurs par type d'explication
      const type = explanationMetrics.explanationType || 'general';
      
      // Si le type n'existe pas encore, l'initialiser
      if (!performanceMetrics.explanations.byType[type]) {
        performanceMetrics.explanations.byType[type] = {
          total: 0,
          helpful: 0,
          notHelpful: 0,
          acceptanceRate: 0
        };
      }
      
      // Mise à jour des compteurs pour ce type
      performanceMetrics.explanations.byType[type].total++;
      if (explanationMetrics.isHelpful) {
        performanceMetrics.explanations.byType[type].helpful++;
      } else {
        performanceMetrics.explanations.byType[type].notHelpful++;
      }
      
      // Calcul du taux d'acceptation pour ce type
      const typeMetrics = performanceMetrics.explanations.byType[type];
      typeMetrics.acceptanceRate = typeMetrics.total > 0 
        ? (typeMetrics.helpful / typeMetrics.total) * 100 
        : 0;
      
      // Enregistrement des métriques mises à jour
      performanceMetrics.lastUpdated = new Date().toISOString();
      await this.savePerformanceMetrics(tenantId, performanceMetrics);
      
      console.log(`Métriques d'explication mises à jour pour le type: ${type}`);
      
      return performanceMetrics;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des métriques d\'explication:', error);
      return this.loadPerformanceMetrics(tenantId);
    }
  }

  /**
   * Enregistre le feedback de l'utilisateur pour améliorer les suggestions futures
   * @param tenantId ID du tenant pour lequel enregistrer le feedback
   * @param data Données extraites du document
   * @param selectedAccount Compte sélectionné par l'utilisateur
   */
  public async recordFeedback(tenantId: string, data: ExtractedData, selectedAccount: AccountSuggestion): Promise<void> {
    if (!data || !selectedAccount) return;

    const feedback: UserFeedback = {
      extractedData: data,
      selectedAccount: selectedAccount,
      timestamp: new Date().toISOString(),
      confidence: selectedAccount.scoreConfiance
    };
    
    // Créer un pattern d'apprentissage à partir du feedback
    await this.createLearningPattern(tenantId, feedback);
  }
  
  /**
   * Crée un pattern d'apprentissage à partir du feedback utilisateur
   * @param tenantId ID du tenant pour lequel créer le pattern
   * @param feedback Feedback utilisateur
   */
  private async createLearningPattern(tenantId: string, feedback: UserFeedback): Promise<void> {
    const { extractedData, selectedAccount } = feedback;
    
    // Extraire les informations pertinentes pour créer des patterns
    const patterns: string[] = [];
    
    // Ajouter le nom du fournisseur comme pattern s'il existe
    if (extractedData.fournisseur) {
      patterns.push(extractedData.fournisseur.toLowerCase());
    }
    
    // Ajouter des mots-clés du libellé comme patterns
    if (extractedData.libelle) {
      const keywords = extractedData.libelle.toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 3);
      patterns.push(...keywords);
    }
    
    // Ajouter la référence formatée comme pattern
    if (extractedData.reference) {
      patterns.push(extractedData.reference.replace(/\d+/g, '#'));
    }
    
    // Pour chaque pattern identifié, créer ou mettre à jour un LearningPattern
    for (const patternText of patterns) {
      // Rechercher si le pattern existe déjà
      const existingPattern = await this.findPatternByText(tenantId, patternText, selectedAccount.compteCode);
      
      if (existingPattern) {
        // Mettre à jour le pattern existant
        existingPattern.occurrences += 1;
        existingPattern.confidence = Math.min(1.0, existingPattern.confidence + 0.05);
        existingPattern.lastUsed = new Date();
        await this.savePattern(existingPattern, tenantId);
      } else {
        // Créer un nouveau pattern
        // Récupérer l'UUID du compte correspondant au code pour respecter la FK
      const accountId = await accountRepo.findIdByCode(tenantId, selectedAccount.compteCode);
      if (!accountId) {
        console.warn(`Aucun compte trouvé pour le code ${selectedAccount.compteCode} (tenant ${tenantId}). Pattern ignoré.`);
        continue;
      }
      const newPattern: LearningPattern = {
          pattern: patternText,
          accountId: accountId,
          accountCode: selectedAccount.compteCode,
          occurrences: 1,
          confidence: 0.5, // Confiance initiale modérée
          lastUsed: new Date()
        };
        await this.savePattern(newPattern, tenantId);
      }
    }
  }

  /**
   * Suggère des comptes en fonction des données extraites
   * @param tenantId ID du tenant pour lequel suggérer des comptes
   * @param data Données extraites du document
   * @returns Liste des suggestions de comptes
   */
  public async suggestAccounts(tenantId: string, data: ExtractedData): Promise<AccountSuggestion[]> {
    // Charger dynamiquement les patterns pour ce tenant
    const patterns = await this.loadPatterns(tenantId);
    
    if (!data) return [];
    
    const suggestions: AccountSuggestion[] = [];
    const matchedPatterns = new Map<string, { confidence: number, pattern: string }>();

    if (data.libelle) {
      this.findMatchingPatterns(data.libelle, patterns, matchedPatterns);
    }
    if (data.fournisseur) {
      this.findMatchingPatterns(data.fournisseur, patterns, matchedPatterns);
    }
    if (data.reference) {
      this.findMatchingPatterns(data.reference, patterns, matchedPatterns);
    }

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
   * @param patterns Liste des patterns à utiliser pour la recherche
   * @param matchedPatterns Map des correspondances à mettre à jour
   */
  private findMatchingPatterns(
    text: string, 
    patterns: LearningPattern[], 
    matchedPatterns: Map<string, { confidence: number, pattern: string }>
  ): void {
    const textLower = text.toLowerCase();
    
    for (const pattern of patterns) {
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

  /**
   * Récupère les métriques de performance actuelles
   * @param tenantId ID du tenant pour lequel récupérer les métriques
   * @returns Les métriques de performance
   */
  public async getPerformanceMetrics(tenantId: string): Promise<PerformanceMetrics> {
    return await this.loadPerformanceMetrics(tenantId);
  }

  /**
   * Récupère les patterns d'apprentissage avec filtres optionnels
   * @param tenantId ID du tenant pour lequel récupérer les patterns
   * @param filters Filtres optionnels (code compte, confiance min, occurrences min, limite)
   * @returns Liste des patterns filtrés et triés
   */
  public async getPatterns(tenantId: string, filters?: {
    accountCode?: string;
    minConfidence?: number;
    minOccurrences?: number;
    limit?: number;
  }): Promise<LearningPattern[]> {
    try {
      const where: Prisma.LearningPatternWhereInput = {};

      where.tenantId = tenantId;

      if (filters?.accountCode) {
        where.account = {
          code: filters.accountCode,
        };
      }
      if (filters?.minConfidence) {
        where.confidence = { gte: filters.minConfidence };
      }
      if (filters?.minOccurrences) {
        where.occurrences = { gte: filters.minOccurrences };
      }

      const patterns = await prisma.learningPattern.findMany({
        where,
        include: {
          account: {
            select: {
              code: true,
            },
          },
        },
        orderBy: [
          { confidence: 'desc' },
          { occurrences: 'desc' },
        ],
        take: filters?.limit,
      });

      return patterns.map(p => ({
        pattern: p.pattern,
        accountId: p.accountId,
        accountCode: p.account.code,
        occurrences: p.occurrences,
        confidence: p.confidence,
        lastUsed: p.lastUsed,
      }));
    } catch (error) {
      console.error('Erreur lors de la récupération des patterns depuis la DB:', error);
      return [];
    }
  }
}

export default new AdaptiveLearningService();
