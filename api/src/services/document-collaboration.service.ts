import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { 
  DocumentComment, 
  CreateCommentRequest, 
  UpdateCommentRequest, 
  GetCommentsOptions,
  DocumentAssignment,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  GetAssignmentsOptions,
  AssignmentStatus
} from '../models/document-collaboration.model';

/**
 * Service de gestion des fonctionnalités de collaboration
 * Permet de gérer les commentaires et les assignations sur les documents
 */
class DocumentCollaborationService {
  private commentsFilePath: string;
  private assignmentsFilePath: string;
  
  constructor() {
    // Chemins vers les fichiers de stockage
    this.commentsFilePath = path.join(__dirname, '../../data/document-comments.json');
    this.assignmentsFilePath = path.join(__dirname, '../../data/document-assignments.json');
    this.ensureDataFilesExist();
  }
  
  /**
   * S'assure que les fichiers de données existent, sinon les crée
   */
  private ensureDataFilesExist(): void {
    const dataDir = path.dirname(this.commentsFilePath);
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (!fs.existsSync(this.commentsFilePath)) {
      fs.writeFileSync(this.commentsFilePath, JSON.stringify({}));
    }
    
    if (!fs.existsSync(this.assignmentsFilePath)) {
      fs.writeFileSync(this.assignmentsFilePath, JSON.stringify({}));
    }
  }
  
  /**
   * Lit les commentaires depuis le fichier de données
   */
  private readComments(): Record<string, DocumentComment[]> {
    try {
      const data = fs.readFileSync(this.commentsFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Erreur lors de la lecture des commentaires:', error);
      return {};
    }
  }
  
  /**
   * Écrit les commentaires dans le fichier
   */
  private writeComments(data: Record<string, DocumentComment[]>): void {
    try {
      fs.writeFileSync(this.commentsFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Erreur lors de l\'écriture des commentaires:', error);
    }
  }
  
  /**
   * Lit les assignations depuis le fichier de données
   */
  private readAssignments(): Record<string, DocumentAssignment[]> {
    try {
      const data = fs.readFileSync(this.assignmentsFilePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Erreur lors de la lecture des assignations:', error);
      return {};
    }
  }
  
  /**
   * Écrit les assignations dans le fichier
   */
  private writeAssignments(data: Record<string, DocumentAssignment[]>): void {
    try {
      fs.writeFileSync(this.assignmentsFilePath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Erreur lors de l\'écriture des assignations:', error);
    }
  }
  
  /**
   * Crée un nouveau commentaire sur un document
   */
  async createComment(commentData: CreateCommentRequest): Promise<DocumentComment> {
    const data = this.readComments();
    
    // Récupérer les commentaires existants du document ou initialiser un tableau vide
    const documentComments = data[commentData.documentId] || [];
    
    // Créer le nouveau commentaire
    const newComment: DocumentComment = {
      id: uuidv4(),
      documentId: commentData.documentId,
      createdAt: new Date().toISOString(),
      createdBy: commentData.createdBy,
      content: commentData.content,
      isResolved: false
    };
    
    // Ajouter l'ID du commentaire parent si c'est une réponse
    if (commentData.parentId) {
      newComment.parentId = commentData.parentId;
    }
    
    // Ajouter le nouveau commentaire à la liste des commentaires du document
    documentComments.push(newComment);
    data[commentData.documentId] = documentComments;
    
    // Sauvegarder les données
    this.writeComments(data);
    
    return newComment;
  }
  
  /**
   * Récupère les commentaires d'un document spécifique
   */
  async getComments(options: GetCommentsOptions): Promise<DocumentComment[]> {
    const data = this.readComments();
    
    // Vérifier si le document existe
    if (!data[options.documentId]) {
      return [];
    }
    
    let comments = [...data[options.documentId]];
    
    // Filtrer par commentaire parent
    if (options.parentId !== undefined) {
      comments = comments.filter(c => c.parentId === options.parentId);
    }
    
    // Filtrer par statut de résolution
    if (options.includeResolved === false) {
      comments = comments.filter(c => !c.isResolved);
    }
    
    // Trier les commentaires
    comments.sort((a, b) => {
      return options.sortDirection === 'asc'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    // Appliquer la pagination si spécifiée
    if (options.limit !== undefined && options.offset !== undefined) {
      comments = comments.slice(options.offset, options.offset + options.limit);
    }
    
    return comments;
  }
  
  /**
   * Met à jour un commentaire existant
   */
  async updateComment(commentId: string, updateData: UpdateCommentRequest): Promise<DocumentComment | null> {
    const data = this.readComments();
    let updatedComment: DocumentComment | null = null;
    
    // Parcourir tous les documents pour trouver le commentaire
    for (const documentId in data) {
      const commentIndex = data[documentId].findIndex(c => c.id === commentId);
      
      if (commentIndex !== -1) {
        // Mettre à jour le commentaire
        const comment = data[documentId][commentIndex];
        
        updatedComment = {
          ...comment,
          content: updateData.content !== undefined ? updateData.content : comment.content,
          isResolved: updateData.isResolved !== undefined ? updateData.isResolved : comment.isResolved,
          updatedAt: new Date().toISOString()
        };
        
        data[documentId][commentIndex] = updatedComment;
        this.writeComments(data);
        break;
      }
    }
    
    return updatedComment;
  }
  
  /**
   * Supprime un commentaire
   */
  async deleteComment(commentId: string): Promise<boolean> {
    const data = this.readComments();
    let deleted = false;
    
    // Parcourir tous les documents pour trouver le commentaire
    for (const documentId in data) {
      const commentIndex = data[documentId].findIndex(c => c.id === commentId);
      
      if (commentIndex !== -1) {
        // Supprimer le commentaire
        data[documentId].splice(commentIndex, 1);
        this.writeComments(data);
        deleted = true;
        break;
      }
    }
    
    return deleted;
  }
  
  /**
   * Crée une nouvelle assignation de document
   */
  async createAssignment(assignmentData: CreateAssignmentRequest): Promise<DocumentAssignment> {
    const data = this.readAssignments();
    
    // Récupérer les assignations existantes du document ou initialiser un tableau vide
    const documentAssignments = data[assignmentData.documentId] || [];
    
    // Créer la nouvelle assignation
    const newAssignment: DocumentAssignment = {
      id: uuidv4(),
      documentId: assignmentData.documentId,
      assignedTo: assignmentData.assignedTo,
      assignedBy: assignmentData.assignedBy,
      assignedAt: new Date().toISOString(),
      status: AssignmentStatus.PENDING,
      priority: assignmentData.priority || 'medium'
    };
    
    // Ajouter des champs optionnels s'ils sont fournis
    if (assignmentData.dueDate) {
      newAssignment.dueDate = assignmentData.dueDate;
    }
    
    if (assignmentData.description) {
      newAssignment.description = assignmentData.description;
    }
    
    // Ajouter la nouvelle assignation à la liste des assignations du document
    documentAssignments.push(newAssignment);
    data[assignmentData.documentId] = documentAssignments;
    
    // Sauvegarder les données
    this.writeAssignments(data);
    
    return newAssignment;
  }
  
  /**
   * Récupère les assignations selon les critères spécifiés
   */
  async getAssignments(options: GetAssignmentsOptions): Promise<DocumentAssignment[]> {
    const data = this.readAssignments();
    let assignments: DocumentAssignment[] = [];
    
    // Si un documentId est spécifié, récupérer seulement les assignations de ce document
    if (options.documentId) {
      assignments = data[options.documentId] || [];
    } else {
      // Sinon, récupérer toutes les assignations
      assignments = Object.values(data).flat();
    }
    
    // Filtrer par utilisateur assigné
    if (options.assignedTo) {
      assignments = assignments.filter(a => a.assignedTo === options.assignedTo);
    }
    
    // Filtrer par statut
    if (options.status && options.status.length > 0) {
      assignments = assignments.filter(a => options.status?.includes(a.status));
    }
    
    // Trier les assignations
    assignments.sort((a, b) => {
      return options.sortDirection === 'asc'
        ? new Date(a.assignedAt).getTime() - new Date(b.assignedAt).getTime()
        : new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime();
    });
    
    // Appliquer la pagination si spécifiée
    if (options.limit !== undefined && options.offset !== undefined) {
      assignments = assignments.slice(options.offset, options.offset + options.limit);
    }
    
    return assignments;
  }
  
  /**
   * Met à jour une assignation existante
   */
  async updateAssignment(assignmentId: string, updateData: UpdateAssignmentRequest): Promise<DocumentAssignment | null> {
    const data = this.readAssignments();
    let updatedAssignment: DocumentAssignment | null = null;
    
    // Parcourir tous les documents pour trouver l'assignation
    for (const documentId in data) {
      const assignmentIndex = data[documentId].findIndex(a => a.id === assignmentId);
      
      if (assignmentIndex !== -1) {
        // Mettre à jour l'assignation
        const assignment = data[documentId][assignmentIndex];
        
        updatedAssignment = {
          ...assignment
        };
        
        // Mettre à jour le statut si spécifié
        if (updateData.status !== undefined) {
          updatedAssignment.status = updateData.status;
          
          // Si le statut passe à complété, enregistrer la date d'achèvement
          if (updateData.status === AssignmentStatus.COMPLETED && !updatedAssignment.completedAt) {
            updatedAssignment.completedAt = new Date().toISOString();
          }
        }
        
        // Mettre à jour les autres champs si spécifiés
        if (updateData.dueDate !== undefined) {
          updatedAssignment.dueDate = updateData.dueDate;
        }
        
        if (updateData.description !== undefined) {
          updatedAssignment.description = updateData.description;
        }
        
        if (updateData.priority !== undefined) {
          updatedAssignment.priority = updateData.priority;
        }
        
        data[documentId][assignmentIndex] = updatedAssignment;
        this.writeAssignments(data);
        break;
      }
    }
    
    return updatedAssignment;
  }
  
  /**
   * Supprime une assignation
   */
  async deleteAssignment(assignmentId: string): Promise<boolean> {
    const data = this.readAssignments();
    let deleted = false;
    
    // Parcourir tous les documents pour trouver l'assignation
    for (const documentId in data) {
      const assignmentIndex = data[documentId].findIndex(a => a.id === assignmentId);
      
      if (assignmentIndex !== -1) {
        // Supprimer l'assignation
        data[documentId].splice(assignmentIndex, 1);
        this.writeAssignments(data);
        deleted = true;
        break;
      }
    }
    
    return deleted;
  }
  
  /**
   * Supprime toutes les assignations et commentaires d'un document
   * Utilisé lorsqu'un document est définitivement supprimé
   */
  async deleteAllCollaborationData(documentId: string): Promise<boolean> {
    // Supprimer les commentaires
    const commentsData = this.readComments();
    if (commentsData[documentId]) {
      delete commentsData[documentId];
      this.writeComments(commentsData);
    }
    
    // Supprimer les assignations
    const assignmentsData = this.readAssignments();
    if (assignmentsData[documentId]) {
      delete assignmentsData[documentId];
      this.writeAssignments(assignmentsData);
    }
    
    return true;
  }
}

export default new DocumentCollaborationService();
