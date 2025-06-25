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
exports.OcrController = void 0;
const event_service_1 = __importDefault(require("../services/event.service"));
const event_service_2 = require("../services/event.service");
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const ocr_service_1 = __importDefault(require("../services/ocr.service"));
const ai_classification_service_1 = __importDefault(require("../services/ai-classification.service"));
const adaptive_learning_service_1 = __importDefault(require("../services/adaptive-learning.service"));
class OcrController {
    /**
     * Traite un fichier uploadé pour en extraire les données
     * @param req Requête HTTP
     * @param res Réponse HTTP
     */
    async processFile(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({ success: false, message: 'Aucun fichier n\'a été téléchargé' });
                return;
            }
            const filePath = req.file.path;
            const fileExt = path.extname(filePath).toLowerCase();
            const supportedFormats = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.bmp'];
            if (!supportedFormats.includes(fileExt)) {
                await fs.remove(filePath);
                res.status(400).json({
                    success: false,
                    message: `Format de fichier non supporté. Formats acceptés: ${supportedFormats.join(', ')}`
                });
                return;
            }
            // Extraction des données du fichier
            const extractedData = await ocr_service_1.default.extractDataFromFile(filePath);
            res.status(200).json({
                success: true,
                data: extractedData
            });
        }
        catch (error) {
            console.error('Erreur lors du traitement du fichier:', error);
            res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors du traitement du fichier',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * Classifie un document et suggère des comptes comptables
     */
    async classifyDocument(req, res) {
        try {
            const { extractedData } = req.body;
            if (!extractedData) {
                res.status(400).json({ success: false, message: 'Données extraites manquantes' });
                return;
            }
            const classificationResult = ai_classification_service_1.default.classifyDocument(extractedData);
            // Enrichir extractedData avec la meilleure suggestion initiale
            if (classificationResult.suggestions && classificationResult.suggestions.length > 0) {
                extractedData.initialAISuggestion = classificationResult.suggestions[0];
            }
            res.status(200).json({
                success: true,
                extractedData, // Retourner extractedData enrichi
                classification: classificationResult
            });
        }
        catch (error) {
            console.error('Erreur lors de la classification du document:', error);
            res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de la classification du document',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * Process et classifie un fichier en une seule étape
     * @param req Requête HTTP
     * @param res Réponse HTTP
     */
    async processAndClassify(req, res) {
        try {
            if (!req.file) {
                res.status(400).json({ success: false, message: 'Aucun fichier n\'a été téléchargé' });
                return;
            }
            const filePath = req.file.path;
            const fileExt = path.extname(filePath).toLowerCase();
            const supportedFormats = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.bmp'];
            if (!supportedFormats.includes(fileExt)) {
                await fs.remove(filePath);
                res.status(400).json({
                    success: false,
                    message: `Format de fichier non supporté. Formats acceptés: ${supportedFormats.join(', ')}`
                });
                return;
            }
            // Vérification spécifique pour les PDF
            if (fileExt === '.pdf') {
                try {
                    // Vérification de la taille du fichier
                    const stats = await fs.stat(filePath);
                    if (stats.size === 0) {
                        await fs.remove(filePath);
                        res.status(400).json({
                            success: false,
                            message: 'Le fichier PDF est vide'
                        });
                        return;
                    }
                    // Vérifier si c'est un PDF généré par ChatGPT (basé sur le flag du frontend)
                    const isChatGptPdf = req.body && req.body.isChatGptPdf === 'true';
                    if (isChatGptPdf) {
                        console.log('PDF généré par ChatGPT détecté, utilisation du mode de compatibilité');
                    }
                    // Tenter de lire les premières pages pour vérifier la validité du PDF
                    // Cette étape peut détecter les erreurs de structure PDF comme "bad XRef entry"
                    try {
                        await ocr_service_1.default.validatePdf(filePath, isChatGptPdf);
                    }
                    catch (pdfError) {
                        await fs.remove(filePath);
                        // Erreur spécifique pour les PDF corrompus
                        if (pdfError.message && (pdfError.message.includes('XRef') || pdfError.message.includes('corrupt'))) {
                            res.status(400).json({
                                success: false,
                                message: 'Le fichier PDF est corrompu ou mal formaté',
                                details: pdfError.message
                            });
                            return;
                        }
                        throw pdfError; // Propager d'autres erreurs PDF
                    }
                }
                catch (validationError) {
                    console.error('Erreur lors de la validation du PDF:', validationError);
                    res.status(500).json({
                        success: false,
                        message: 'Erreur lors de la validation du fichier PDF',
                        details: validationError.message
                    });
                    return;
                }
            }
            // Extraction des données du fichier
            const extractedData = await ocr_service_1.default.extractDataFromFile(filePath);
            // Classification des données extraites
            const classificationResult = ai_classification_service_1.default.classifyDocument(extractedData);
            // Enrichir extractedData avec la meilleure suggestion initiale
            if (classificationResult.suggestions && classificationResult.suggestions.length > 0) {
                extractedData.initialAISuggestion = classificationResult.suggestions[0];
            }
            res.status(200).json({
                success: true,
                extractedData, // extractedData est maintenant enrichi
                classification: classificationResult
            });
        }
        catch (error) {
            console.error('Erreur lors du traitement et de la classification du fichier:', error);
            // Gestion spécifique des erreurs PDF
            if (error.message && error.message.includes('bad XRef entry')) {
                res.status(400).json({
                    success: false,
                    message: 'Le fichier PDF est corrompu ou mal formaté (bad XRef entry)',
                    details: 'Le PDF contient une table de références croisées (XRef) invalide. Veuillez vérifier le fichier ou essayer un autre document.'
                });
                return;
            }
            // Gestion générique des erreurs
            res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors du traitement et de la classification du fichier',
                error: error.message || String(error),
                errorType: error.name || 'Unknown Error'
            });
        }
    }
    /**
     * Enregistre le feedback de l'utilisateur pour améliorer les suggestions futures
     * @param req Requête HTTP contenant les données extraites et le compte sélectionné
     * @param res Réponse HTTP
     */
    async recordFeedback(req, res) {
        try {
            const { extractedData, selectedAccount } = req.body;
            if (!extractedData || !selectedAccount) {
                res.status(400).json({
                    success: false,
                    message: 'Données manquantes: extractedData et selectedAccount sont requis'
                });
                return;
            }
            // Enregistrer le feedback dans le service de classification IA
            ai_classification_service_1.default.recordUserFeedback(extractedData, selectedAccount);
            // Emit event for OCR feedback submission
            try {
                // S'assurer que req.user et req.user.id sont disponibles (via le middleware d'authentification)
                if (req.user && req.user.id) {
                    const userId = req.user.id;
                    const tenantId = req.user.tenantId || null;
                    let userName = req.user.nom; // Supposant que 'nom' (name) est sur req.user
                    const docId = extractedData.documentId || null;
                    const docName = extractedData.numeroFacture || extractedData.reference || (docId ? `Document ${docId}` : 'Document inconnu');
                    const eventData = {
                        userId: userId,
                        userName: userName,
                        tenantId: tenantId,
                        documentId: docId,
                        documentName: docName,
                    };
                    event_service_1.default.emit(event_service_2.EventType.OCR_FEEDBACK_SUBMITTED, eventData);
                }
                else {
                    console.warn('User information not available in request (req.user.id missing), skipping OCR feedback notification.');
                }
            }
            catch (eventError) {
                console.error('Failed to emit OCR_FEEDBACK_SUBMITTED event:', eventError);
            }
            res.status(200).json({
                success: true,
                message: 'Feedback enregistré avec succès'
            });
        }
        catch (error) { // Ceci est le bloc catch original pour l'opération principale
            console.error('Erreur lors de l\'enregistrement du feedback:', error);
            res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de l\'enregistrement du feedback',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * Sauvegarde les données extraites modifiées manuellement
     * @param req Requête HTTP contenant les données extraites modifiées
     * @param res Réponse HTTP
     */
    async saveEditedData(req, res) {
        try {
            const { editedData, documentId } = req.body;
            if (!editedData) {
                res.status(400).json({
                    success: false,
                    message: 'Données manquantes: editedData est requis'
                });
                return;
            }
            // Valider les données de base
            if (editedData.montant && isNaN(Number(editedData.montant))) {
                res.status(400).json({
                    success: false,
                    message: 'Le montant doit être un nombre valide'
                });
                return;
            }
            if (editedData.tva && isNaN(Number(editedData.tva))) {
                res.status(400).json({
                    success: false,
                    message: 'La TVA doit être un nombre valide'
                });
                return;
            }
            // Sauvegarder les données modifiées
            const result = await ocr_service_1.default.saveEditedData(editedData, documentId);
            res.status(200).json({
                success: true,
                message: 'Données modifiées sauvegardées avec succès',
                data: result.data
            });
        }
        catch (error) {
            console.error('Erreur lors de la sauvegarde des données modifiées:', error);
            res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de la sauvegarde des données modifiées',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * Récupère les patterns d'apprentissage adaptatif
     * @param req Requête HTTP
     * @param res Réponse HTTP
     */
    async getLearningPatterns(req, res) {
        try {
            // Paramètres optionnels de filtrage
            const { accountCode, minConfidence, minOccurrences, limit } = req.query;
            // Récupérer les patterns
            const patterns = adaptive_learning_service_1.default.getPatterns({
                accountCode: accountCode,
                minConfidence: minConfidence ? parseFloat(minConfidence) : undefined,
                minOccurrences: minOccurrences ? parseInt(minOccurrences) : undefined,
                limit: limit ? parseInt(limit) : undefined
            });
            res.status(200).json({
                success: true,
                count: patterns.length,
                data: patterns
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des patterns d\'apprentissage:', error);
            res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de la récupération des patterns d\'apprentissage',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * Récupère les métriques de performance
     * @param req Requête HTTP
     * @param res Réponse HTTP
     */
    async getPerformanceMetrics(req, res) {
        try {
            const metrics = adaptive_learning_service_1.default.getPerformanceMetrics();
            res.status(200).json({
                success: true,
                data: metrics
            });
        }
        catch (error) {
            console.error('Erreur lors de la récupération des métriques de performance:', error);
            res.status(500).json({
                success: false,
                message: 'Une erreur est survenue lors de la récupération des métriques de performance',
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
}
exports.OcrController = OcrController;
exports.default = new OcrController();
