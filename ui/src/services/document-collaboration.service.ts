import axios from 'axios';
import { API_URL } from '../config/constants';
import type {
  DocumentComment,
  CreateCommentRequest,
  UpdateCommentRequest,
  GetCommentsOptions,
  DocumentAssignment,
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  GetAssignmentsOptions,
  AssignmentStatus
} from '../types/document-collaboration';

/**
 * URL de base pour les API de collaboration
 */
const BASE_URL = `${API_URL}/collaboration`;

/**
 * Service pour gérer les fonctionnalités de collaboration sur les documents
 * Commentaires et assignations
 */
class DocumentCollaborationService {
  /**
   * Crée un nouveau commentaire sur un document
   */
  async createComment(data: CreateCommentRequest): Promise<DocumentComment> {
    const response = await axios.post(`${BASE_URL}/comments`, data);
    return response.data;
  }

  /**
   * Récupère les commentaires d'un document
   */
  async getComments(options: GetCommentsOptions): Promise<DocumentComment[]> {
    const response = await axios.get(`${BASE_URL}/comments`, {
      params: options
    });
    return response.data;
  }

  /**
   * Met à jour un commentaire existant
   */
  async updateComment(commentId: string, data: UpdateCommentRequest): Promise<DocumentComment> {
    const response = await axios.put(`${BASE_URL}/comments/${commentId}`, data);
    return response.data;
  }

  /**
   * Supprime un commentaire
   */
  async deleteComment(commentId: string): Promise<void> {
    await axios.delete(`${BASE_URL}/comments/${commentId}`);
  }

  /**
   * Marque un commentaire comme résolu ou non résolu
   */
  async toggleCommentResolution(commentId: string, isResolved: boolean): Promise<DocumentComment> {
    return this.updateComment(commentId, { isResolved });
  }

  /**
   * Crée une nouvelle assignation pour un document
   */
  async createAssignment(data: CreateAssignmentRequest): Promise<DocumentAssignment> {
    const response = await axios.post(`${BASE_URL}/assignments`, data);
    return response.data;
  }

  /**
   * Récupère les assignations selon les critères spécifiés
   */
  async getAssignments(options?: GetAssignmentsOptions): Promise<DocumentAssignment[]> {
    const response = await axios.get(`${BASE_URL}/assignments`, {
      params: options
    });
    return response.data;
  }

  /**
   * Met à jour une assignation existante
   */
  async updateAssignment(assignmentId: string, data: UpdateAssignmentRequest): Promise<DocumentAssignment> {
    const response = await axios.put(`${BASE_URL}/assignments/${assignmentId}`, data);
    return response.data;
  }

  /**
   * Change le statut d'une assignation
   */
  async updateAssignmentStatus(assignmentId: string, status: AssignmentStatus): Promise<DocumentAssignment> {
    return this.updateAssignment(assignmentId, { status });
  }

  /**
   * Supprime une assignation
   */
  async deleteAssignment(assignmentId: string): Promise<void> {
    await axios.delete(`${BASE_URL}/assignments/${assignmentId}`);
  }

  /**
   * Supprime toutes les données de collaboration d'un document
   */
  async deleteAllCollaborationData(documentId: string): Promise<void> {
    await axios.delete(`${BASE_URL}/document/${documentId}`);
  }
}

export default new DocumentCollaborationService();
