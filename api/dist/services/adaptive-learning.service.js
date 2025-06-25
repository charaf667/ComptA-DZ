"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdaptiveLearningService = void 0;
const fs_1 = __importDefault(require("fs"));
const path = __importStar(require("path"));
/**
 * Service d'apprentissage adaptatif pour améliorer les suggestions de classification
 * au fil du temps en fonction des choix de l'utilisateur
 */
class AdaptiveLearningService {
    constructor() {
        this.patterns = [];
        this.CONFIDENCE_THRESHOLD = 0.75;
        this.MIN_OCCURRENCES = 2;
        this.performanceMetrics = {
            totalSuggestions: 0,
            acceptedSuggestions: 0,
            rejectedSuggestions: 0,
            averageDecisionTime: 0,
        };
        this.dataPath = path.join(__dirname, '..', '..', 'data', 'learning-patterns.json');
        this.loadPatterns();
        this.loadPerformanceMetrics();
    }
    /**
     * Charge les patterns d'apprentissage depuis le fichier
     */
    loadPatterns() {
        try {
            // Créer le dossier data s'il n'existe pas
            const dataDir = path.dirname(this.dataPath);
            if (!fs_1.default.existsSync(dataDir)) {
                fs_1.default.mkdirSync(dataDir, { recursive: true });
            }
            // Charger les patterns s'ils existent
            if (fs_1.default.existsSync(this.dataPath)) {
                const data = fs_1.default.readFileSync(this.dataPath, 'utf8');
                this.patterns = JSON.parse(data);
                console.log(`Patterns d'apprentissage chargés: ${this.patterns.length}`);
            }
            else {
                // Créer un fichier vide si inexistant
                this.patterns = [];
                fs_1.default.writeFileSync(this.dataPath, JSON.stringify(this.patterns, null, 2));
                console.log('Fichier de patterns d\'apprentissage créé');
            }
        }
        catch (error) {
            console.error('Erreur lors du chargement des patterns:', error);
            this.patterns = [];
        }
    }
    /**
     * Sauvegarde les patterns d'apprentissage dans le fichier
     */
    /**
     * Met à jour et sauvegarde les métriques de performance.
     * @param isAccepted Indique si la suggestion initiale a été acceptée.
     * @param decisionTime Temps pris pour la décision (optionnel, pour usage futur).
     */
    updatePerformanceMetrics(isAccepted, decisionTime) {
        this.loadPerformanceMetrics(); // Charger les dernières métriques
        this.performanceMetrics.totalSuggestions = (this.performanceMetrics.totalSuggestions || 0) + 1;
        if (isAccepted) {
            this.performanceMetrics.acceptedSuggestions = (this.performanceMetrics.acceptedSuggestions || 0) + 1;
        }
        else {
            this.performanceMetrics.rejectedSuggestions = (this.performanceMetrics.rejectedSuggestions || 0) + 1;
        }
        // Logique pour averageDecisionTime à ajouter si decisionTime est fourni
        // if (decisionTime !== undefined) { ... }
        this.savePerformanceMetrics();
        console.log(`Performance metrics updated: total=${this.performanceMetrics.totalSuggestions}, accepted=${this.performanceMetrics.acceptedSuggestions}, rejected=${this.performanceMetrics.rejectedSuggestions}`);
    }
    /**
     * Sauvegarde les patterns d'apprentissage dans le fichier
     */
    savePatterns() {
        try {
            fs_1.default.writeFileSync(this.dataPath, JSON.stringify(this.patterns, null, 2));
        }
        catch (error) {
            console.error('Erreur lors de la sauvegarde des patterns:', error);
        }
    }
    /**
     * Charge les métriques de performance depuis le fichier
     */
    loadPerformanceMetrics() {
        const metricsPath = path.join(__dirname, '..', '..', 'data', 'performance-metrics.json');
        try {
            const dataDir = path.dirname(metricsPath);
            if (!fs_1.default.existsSync(dataDir)) {
                fs_1.default.mkdirSync(dataDir, { recursive: true });
                console.log(`Dossier de données créé: ${dataDir}`);
            }
            if (fs_1.default.existsSync(metricsPath)) {
                const data = fs_1.default.readFileSync(metricsPath, 'utf8');
                this.performanceMetrics = JSON.parse(data);
                console.log(`Métriques de performance chargées depuis ${metricsPath}`);
            }
            else {
                // Si le fichier n'existe pas, initialiser avec les valeurs par défaut et créer le fichier
                this.performanceMetrics = {
                    totalSuggestions: 0,
                    acceptedSuggestions: 0,
                    rejectedSuggestions: 0,
                    averageDecisionTime: 0,
                };
                fs_1.default.writeFileSync(metricsPath, JSON.stringify(this.performanceMetrics, null, 2));
                console.log(`Fichier de métriques de performance créé avec les valeurs par défaut: ${metricsPath}`);
            }
        }
        catch (error) {
            const err = error;
            console.error(`Erreur lors du chargement ou de la création des métriques de performance (${metricsPath}):`, err.message);
            // En cas d'erreur, s'assurer que performanceMetrics a des valeurs par défaut sûres
            this.performanceMetrics = {
                totalSuggestions: 0,
                acceptedSuggestions: 0,
                rejectedSuggestions: 0,
                averageDecisionTime: 0,
            };
        }
    }
    /**
     * Sauvegarde les métriques de performance dans le fichier
     */
    savePerformanceMetrics() {
        try {
            const metricsPath = path.join(__dirname, '..', '..', 'data', 'performance-metrics.json');
            fs_1.default.writeFileSync(metricsPath, JSON.stringify(this.performanceMetrics, null, 2));
        }
        catch (error) {
            console.error('Erreur lors de la sauvegarde des métriques de performance:', error);
        }
    }
    /**
     * Enregistre le feedback de l'utilisateur pour améliorer les suggestions futures
     * @param data Données extraites du document
     * @param selectedAccount Compte sélectionné par l'utilisateur
     */
    recordFeedback(data, selectedAccount) {
        if (!data || !selectedAccount)
            return;
        const feedback = {
            extractedData: data,
            selectedAccount,
            timestamp: new Date().toISOString(),
            confidence: selectedAccount.scoreConfiance || 0.5
        };
        console.log(`Enregistrement du feedback: ${selectedAccount.compteCode} pour ${data.fournisseur || 'inconnu'}`);
        // Extraire et enregistrer les patterns
        this.extractAndSavePatterns(feedback);
        // Mettre à jour les métriques de performance basées sur le feedback
        if (data.initialAISuggestion) {
            const initialSuggestionCode = data.initialAISuggestion.compteCode;
            const selectedCode = selectedAccount.compteCode;
            const wasAccepted = initialSuggestionCode === selectedCode;
            console.log(`Initial suggestion: ${initialSuggestionCode}, Selected: ${selectedCode}, Accepted: ${wasAccepted}`);
            this.updatePerformanceMetrics(wasAccepted);
        }
        else {
            // Aucune suggestion initiale n'était présente dans les données de feedback.
            // On pourrait choisir d'ignorer, ou de compter cela différemment.
            // Pour l'instant, on ne met à jour que s'il y avait une suggestion initiale.
            console.log('No initial AI suggestion found in feedback data, performance metrics not updated for accept/reject.');
        }
    }
    /**
     * Extrait les patterns d'apprentissage à partir du feedback utilisateur
     * @param feedback Feedback de l'utilisateur
     */
    extractAndSavePatterns(feedback) {
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
    updatePattern(pattern, accountCode, timestamp, baseConfidence) {
        // Rechercher un pattern existant
        const existingPattern = this.patterns.find(p => p.pattern.toLowerCase() === pattern.toLowerCase() &&
            p.accountCode === accountCode);
        if (existingPattern) {
            // Mettre à jour le pattern existant
            existingPattern.occurrences += 1;
            existingPattern.lastUsed = timestamp;
            // Augmenter la confiance avec chaque occurrence, mais plafonner à 0.98
            existingPattern.confidence = Math.min(baseConfidence + (0.05 * Math.log(existingPattern.occurrences)), 0.98);
        }
        else {
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
    suggestAccounts(data) {
        if (!data)
            return [];
        const suggestions = [];
        const matchedPatterns = new Map();
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
    findMatchingPatterns(text, matchedPatterns) {
        const textLower = text.toLowerCase();
        for (const pattern of this.patterns) {
            // Ne considérer que les patterns avec suffisamment d'occurrences
            if (pattern.occurrences < this.MIN_OCCURRENCES)
                continue;
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
    getAccountLabel(accountCode) {
        // Mapping simplifié des codes de compte vers les libellés
        const accountLabels = {
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
     * Enregistre l'interaction utilisateur
     * @param isAccepted Indique si la suggestion a été acceptée
     * @param decisionTime Temps de décision de l'utilisateur
     */
    recordInteraction(isAccepted, decisionTime) {
        this.performanceMetrics.totalSuggestions++;
        if (isAccepted) {
            this.performanceMetrics.acceptedSuggestions++;
        }
        else {
            this.performanceMetrics.rejectedSuggestions++;
        }
        // Calculer le nouveau temps moyen de décision
        const totalTime = this.performanceMetrics.averageDecisionTime * (this.performanceMetrics.totalSuggestions - 1);
        this.performanceMetrics.averageDecisionTime = (totalTime + decisionTime) / this.performanceMetrics.totalSuggestions;
        this.savePerformanceMetrics();
    }
    /**
     * Récupère les métriques de performance
     * @returns Métriques de performance
     */
    getPerformanceMetrics() {
        return this.performanceMetrics;
    }
    /**
     * Récupère les patterns d'apprentissage avec filtres optionnels
     * @param filters Filtres optionnels (code compte, confiance min, occurrences min, limite)
     * @returns Liste des patterns filtrés et triés
     */
    getPatterns(filters) {
        let filteredPatterns = [...this.patterns];
        if (filters?.accountCode) {
            filteredPatterns = filteredPatterns.filter(p => p.accountCode === filters.accountCode);
        }
        if (filters?.minConfidence) {
            filteredPatterns = filteredPatterns.filter(p => p.confidence >= (filters.minConfidence || 0));
        }
        if (filters?.minOccurrences) {
            filteredPatterns = filteredPatterns.filter(p => p.occurrences >= (filters.minOccurrences || 0));
        }
        // Trier par confiance (décroissant) puis par occurrences (décroissant)
        filteredPatterns.sort((a, b) => {
            if (b.confidence !== a.confidence) {
                return b.confidence - a.confidence;
            }
            return b.occurrences - a.occurrences;
        });
        if (filters?.limit) {
            return filteredPatterns.slice(0, filters.limit);
        }
        return filteredPatterns;
    }
}
exports.AdaptiveLearningService = AdaptiveLearningService;
exports.default = new AdaptiveLearningService();
