"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingEntriesController = void 0;
const document_history_service_1 = require("../services/document-history.service");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const documentHistoryService = new document_history_service_1.DocumentHistoryService();
/**
 * Contrôleur pour la gestion des écritures comptables
 */
class AccountingEntriesController {
    constructor() {
        /**
         * Génère une écriture comptable à partir d'un document de l'historique
         */
        this.generateEntry = async (req, res) => {
            try {
                const { documentId, accountCode, amount, supplier, date, description } = req.body;
                // Validation des données
                if (!documentId || !accountCode || !amount) {
                    res.status(400).json({
                        success: false,
                        message: 'Données manquantes: documentId, accountCode et amount sont requis'
                    });
                    return;
                }
                // Vérifier que le document existe
                const document = documentHistoryService.getDocumentById(documentId);
                if (!document) {
                    res.status(404).json({
                        success: false,
                        message: 'Document non trouvé'
                    });
                    return;
                }
                // Créer l'écriture comptable
                const entry = {
                    id: `entry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
                    documentId,
                    accountCode,
                    amount,
                    supplier: supplier || 'Non spécifié',
                    date: date || new Date().toISOString(),
                    description: description || `Écriture générée depuis le document ${documentId}`,
                    createdAt: new Date().toISOString(),
                    status: 'pending'
                };
                // Sauvegarder l'écriture comptable
                this.saveEntry(entry);
                // Mettre à jour le document pour indiquer qu'une écriture a été générée
                const updatedDocument = {
                    ...document,
                    hasAccountingEntry: true
                };
                documentHistoryService.updateDocument(documentId, updatedDocument);
                res.status(201).json({
                    success: true,
                    message: 'Écriture comptable générée avec succès',
                    data: entry
                });
            }
            catch (error) {
                console.error('Erreur lors de la génération de l\'écriture comptable:', error);
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la génération de l\'écriture comptable',
                    error: error instanceof Error ? error.message : 'Erreur inconnue'
                });
            }
        };
        /**
         * Récupère toutes les écritures comptables
         */
        this.getAllEntries = async (req, res) => {
            try {
                const entries = this.loadEntries();
                res.status(200).json({
                    success: true,
                    data: entries
                });
            }
            catch (error) {
                console.error('Erreur lors de la récupération des écritures comptables:', error);
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération des écritures comptables',
                    error: error instanceof Error ? error.message : 'Erreur inconnue'
                });
            }
        };
        /**
         * Récupère les écritures comptables liées à un document
         */
        this.getEntriesByDocumentId = async (req, res) => {
            try {
                const { documentId } = req.params;
                const entries = this.loadEntries().filter(entry => entry.documentId === documentId);
                res.status(200).json({
                    success: true,
                    data: entries
                });
            }
            catch (error) {
                console.error('Erreur lors de la récupération des écritures comptables:', error);
                res.status(500).json({
                    success: false,
                    message: 'Erreur lors de la récupération des écritures comptables',
                    error: error instanceof Error ? error.message : 'Erreur inconnue'
                });
            }
        };
    }
    /**
     * Sauvegarde une écriture comptable dans le fichier JSON
     */
    saveEntry(entry) {
        const entries = this.loadEntries();
        entries.push(entry);
        const dataPath = path_1.default.join(__dirname, '../../data');
        if (!fs_1.default.existsSync(dataPath)) {
            fs_1.default.mkdirSync(dataPath, { recursive: true });
        }
        fs_1.default.writeFileSync(path_1.default.join(dataPath, 'accounting-entries.json'), JSON.stringify(entries, null, 2));
    }
    /**
     * Charge les écritures comptables depuis le fichier JSON
     */
    loadEntries() {
        const filePath = path_1.default.join(__dirname, '../../data/accounting-entries.json');
        if (!fs_1.default.existsSync(filePath)) {
            return [];
        }
        const data = fs_1.default.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }
}
exports.AccountingEntriesController = AccountingEntriesController;
