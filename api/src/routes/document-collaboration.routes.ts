import express, { Request, Response } from 'express';
import documentCollaborationController from '../controllers/document-collaboration.controller';
import asyncHandler from '../utils/express-async-handler';

/**
 * Router pour les fonctionnalités de collaboration sur les documents
 */
const router = express.Router();

// Fonctions de wrapper avec asyncHandler pour gérer correctement les promesses
const createComment = asyncHandler((req: Request, res: Response) => documentCollaborationController.createComment(req, res));
const getComments = asyncHandler((req: Request, res: Response) => documentCollaborationController.getComments(req, res));
const updateComment = asyncHandler((req: Request, res: Response) => documentCollaborationController.updateComment(req, res));
const deleteComment = asyncHandler((req: Request, res: Response) => documentCollaborationController.deleteComment(req, res));
const createAssignment = asyncHandler((req: Request, res: Response) => documentCollaborationController.createAssignment(req, res));
const getAssignments = asyncHandler((req: Request, res: Response) => documentCollaborationController.getAssignments(req, res));
const updateAssignment = asyncHandler((req: Request, res: Response) => documentCollaborationController.updateAssignment(req, res));
const deleteAssignment = asyncHandler((req: Request, res: Response) => documentCollaborationController.deleteAssignment(req, res));
const deleteAllCollaborationData = asyncHandler((req: Request, res: Response) => documentCollaborationController.deleteAllCollaborationData(req, res));

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

export default router;
