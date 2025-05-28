"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const accounting_entries_controller_1 = require("../controllers/accounting-entries.controller");
const router = express_1.default.Router();
const controller = new accounting_entries_controller_1.AccountingEntriesController();
// Route pour générer une écriture comptable
router.post('/generate', controller.generateEntry);
// Route pour récupérer toutes les écritures comptables
router.get('/', controller.getAllEntries);
// Route pour récupérer les écritures comptables liées à un document
router.get('/document/:documentId', controller.getEntriesByDocumentId);
exports.default = router;
