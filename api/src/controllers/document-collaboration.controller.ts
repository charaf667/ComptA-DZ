import { Request, Response } from 'express';
import documentCollaborationService from '../services/document-collaboration.service';
import { AssignmentStatus } from '../models/document-collaboration.model';

/**
 * Contrôleur pour gérer les fonctionnalités de collaboration sur les documents
 * Inclut la gestion des commentaires et des assignations
 */
class DocumentCollaborationController {
  /**
   * Crée un nouveau commentaire
   */
  async createComment(req: Request, res: Response) {
    try {
      const commentData = req.body;
      
      if (!commentData.documentId || !commentData.createdBy || !commentData.content) {
        return res.status(400).json({ error: 'Données incomplètes pour créer un commentaire' });
      }
      
      const newComment = await documentCollaborationService.createComment(commentData);
      res.status(201).json(newComment);
    } catch (error) {
      console.error('Erreur lors de la création d\'un commentaire:', error);
      res.status(500).json({ error: 'Erreur lors de la création du commentaire' });
    }
  }
  
  /**
   * Récupère les commentaires d'un document
   */
  async getComments(req: Request, res: Response) {
    try {
      const { documentId, parentId, includeResolved, sortDirection, limit, offset } = req.query;
      
      if (!documentId) {
        return res.status(400).json({ error: 'ID du document requis' });
      }
      
      const options = {
        documentId: documentId as string,
        parentId: parentId as string | undefined,
        includeResolved: includeResolved === 'true',
        sortDirection: (sortDirection as 'asc' | 'desc') || 'desc',
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined
      };
      
      const comments = await documentCollaborationService.getComments(options);
      res.json(comments);
    } catch (error) {
      console.error('Erreur lors de la récupération des commentaires:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
    }
  }
  
  /**
   * Met à jour un commentaire existant
   */
  async updateComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params;
      const updateData = req.body;
      
      if (!commentId) {
        return res.status(400).json({ error: 'ID du commentaire requis' });
      }
      
      const updatedComment = await documentCollaborationService.updateComment(commentId, updateData);
      
      if (!updatedComment) {
        return res.status(404).json({ error: 'Commentaire non trouvé' });
      }
      
      res.json(updatedComment);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du commentaire:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du commentaire' });
    }
  }
  
  /**
   * Supprime un commentaire
   */
  async deleteComment(req: Request, res: Response) {
    try {
      const { commentId } = req.params;
      
      if (!commentId) {
        return res.status(400).json({ error: 'ID du commentaire requis' });
      }
      
      const deleted = await documentCollaborationService.deleteComment(commentId);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Commentaire non trouvé' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression du commentaire' });
    }
  }
  
  /**
   * Crée une nouvelle assignation
   */
  async createAssignment(req: Request, res: Response) {
    try {
      const assignmentData = req.body;
      
      if (!assignmentData.documentId || !assignmentData.assignedTo || !assignmentData.assignedBy) {
        return res.status(400).json({ error: 'Données incomplètes pour créer une assignation' });
      }
      
      const newAssignment = await documentCollaborationService.createAssignment(assignmentData);
      res.status(201).json(newAssignment);
    } catch (error) {
      console.error('Erreur lors de la création d\'une assignation:', error);
      res.status(500).json({ error: 'Erreur lors de la création de l\'assignation' });
    }
  }
  
  /**
   * Récupère les assignations selon les critères spécifiés
   */
  async getAssignments(req: Request, res: Response) {
    try {
      const { documentId, assignedTo, status, sortDirection, limit, offset } = req.query;
      
      // Convertir le statut en tableau si nécessaire
      let statusArray: AssignmentStatus[] | undefined;
      if (status) {
        if (Array.isArray(status)) {
          statusArray = status as AssignmentStatus[];
        } else {
          statusArray = [status as AssignmentStatus];
        }
      }
      
      const options = {
        documentId: documentId as string | undefined,
        assignedTo: assignedTo as string | undefined,
        status: statusArray,
        sortDirection: (sortDirection as 'asc' | 'desc') || 'desc',
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined
      };
      
      const assignments = await documentCollaborationService.getAssignments(options);
      res.json(assignments);
    } catch (error) {
      console.error('Erreur lors de la récupération des assignations:', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des assignations' });
    }
  }
  
  /**
   * Met à jour une assignation existante
   */
  async updateAssignment(req: Request, res: Response) {
    try {
      const { assignmentId } = req.params;
      const updateData = req.body;
      
      if (!assignmentId) {
        return res.status(400).json({ error: 'ID de l\'assignation requis' });
      }
      
      const updatedAssignment = await documentCollaborationService.updateAssignment(assignmentId, updateData);
      
      if (!updatedAssignment) {
        return res.status(404).json({ error: 'Assignation non trouvée' });
      }
      
      res.json(updatedAssignment);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'assignation:', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'assignation' });
    }
  }
  
  /**
   * Supprime une assignation
   */
  async deleteAssignment(req: Request, res: Response) {
    try {
      const { assignmentId } = req.params;
      
      if (!assignmentId) {
        return res.status(400).json({ error: 'ID de l\'assignation requis' });
      }
      
      const deleted = await documentCollaborationService.deleteAssignment(assignmentId);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Assignation non trouvée' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'assignation:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression de l\'assignation' });
    }
  }
  
  /**
   * Supprime toutes les données de collaboration d'un document
   */
  async deleteAllCollaborationData(req: Request, res: Response) {
    try {
      const { documentId } = req.params;
      
      if (!documentId) {
        return res.status(400).json({ error: 'ID du document requis' });
      }
      
      await documentCollaborationService.deleteAllCollaborationData(documentId);
      res.status(204).send();
    } catch (error) {
      console.error('Erreur lors de la suppression des données de collaboration:', error);
      res.status(500).json({ error: 'Erreur lors de la suppression des données de collaboration' });
    }
  }
}

export default new DocumentCollaborationController();
