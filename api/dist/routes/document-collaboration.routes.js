"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const document_collaboration_controller_1 = __importDefault(require("../controllers/document-collaboration.controller"));
const express_async_handler_1 = __importDefault(require("../utils/express-async-handler"));
/**
 * Router pour les fonctionnalités de collaboration sur les documents
 */
const router = express_1.default.Router();
// Fonctions de wrapper avec asyncHandler pour gérer correctement les promesses
const createComment = (0, express_async_handler_1.default)((req, res) => document_collaboration_controller_1.default.createComment(req, res));
const getComments = (0, express_async_handler_1.default)((req, res) => document_collaboration_controller_1.default.getComments(req, res));
const updateComment = (0, express_async_handler_1.default)((req, res) => document_collaboration_controller_1.default.updateComment(req, res));
const deleteComment = (0, express_async_handler_1.default)((req, res) => document_collaboration_controller_1.default.deleteComment(req, res));
const createAssignment = (0, express_async_handler_1.default)((req, res) => document_collaboration_controller_1.default.createAssignment(req, res));
const getAssignments = (0, express_async_handler_1.default)((req, res) => document_collaboration_controller_1.default.getAssignments(req, res));
const updateAssignment = (0, express_async_handler_1.default)((req, res) => document_collaboration_controller_1.default.updateAssignment(req, res));
const deleteAssignment = (0, express_async_handler_1.default)((req, res) => document_collaboration_controller_1.default.deleteAssignment(req, res));
const deleteAllCollaborationData = (0, express_async_handler_1.default)((req, res) => document_collaboration_controller_1.default.deleteAllCollaborationData(req, res));
// Routes pour les commentaires
router.post('/comments', createComment);
router.get('/comments', getComments);
router.put('/comments/:commentId', updateComment);
router.delete('/comments/:commentId', deleteComment);
// Routes pour les assignations
router.post('/assignments', createAssignment);
router.get('/assignments', getAssignments);
router.put('/assignments/:assignmentId', updateAssignment);
router.delete('/assignments/:assignmentId', deleteAssignment);
// Route pour supprimer toutes les données de collaboration d'un document
router.delete('/document/:documentId', deleteAllCollaborationData);
exports.default = router;
