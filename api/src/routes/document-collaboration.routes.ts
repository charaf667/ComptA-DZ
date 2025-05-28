import { Router } from 'express';
import { Request, Response } from 'express';
import documentCollaborationController from '../controllers/document-collaboration.controller';

/**
 * Router pour les fonctionnalités de collaboration sur les documents
 */
const router = Router();

// Fonctions de wrapper pour gérer correctement le binding des méthodes
const createComment = (req: Request, res: Response) => documentCollaborationController.createComment(req, res);
const getComments = (req: Request, res: Response) => documentCollaborationController.getComments(req, res);
const updateComment = (req: Request, res: Response) => documentCollaborationController.updateComment(req, res);
const deleteComment = (req: Request, res: Response) => documentCollaborationController.deleteComment(req, res);
const createAssignment = (req: Request, res: Response) => documentCollaborationController.createAssignment(req, res);
const getAssignments = (req: Request, res: Response) => documentCollaborationController.getAssignments(req, res);
const updateAssignment = (req: Request, res: Response) => documentCollaborationController.updateAssignment(req, res);
const deleteAssignment = (req: Request, res: Response) => documentCollaborationController.deleteAssignment(req, res);
const deleteAllCollaborationData = (req: Request, res: Response) => documentCollaborationController.deleteAllCollaborationData(req, res);

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
