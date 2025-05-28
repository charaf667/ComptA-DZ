"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const document_history_controller_1 = __importDefault(require("../controllers/document-history.controller"));
const router = express_1.default.Router();
// Routes pour l'historique des documents
router.post('/', document_history_controller_1.default.addDocument);
router.get('/search', document_history_controller_1.default.searchDocuments);
router.get('/statistics', document_history_controller_1.default.getStatistics);
router.get('/:id', document_history_controller_1.default.getDocument);
router.put('/:id', document_history_controller_1.default.updateDocument);
router.delete('/:id', document_history_controller_1.default.deleteDocument);
router.post('/:id/tags', document_history_controller_1.default.addTag);
router.delete('/:id/tags/:tag', document_history_controller_1.default.removeTag);
exports.default = router;
