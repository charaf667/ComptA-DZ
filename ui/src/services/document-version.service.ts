import axios from 'axios';
import { API_URL } from '../config/constants';
import type { 
  DocumentVersion, 
  CreateVersionRequest, 
  GetVersionsOptions, 
  VersionDiffResponse 
} from '../types/document-version';

/**
 * Service frontend pour gérer les versions des documents
 * Communique avec l'API de versionnage
 */
class DocumentVersionService {
  private apiUrl: string;
  
  constructor() {
    this.apiUrl = `${API_URL}/document-versions`;
  }
  
  /**
   * Crée une nouvelle version pour un document
   */
  async createVersion(versionData: CreateVersionRequest): Promise<DocumentVersion> {
    try {
      const response = await axios.post(this.apiUrl, versionData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création d\'une version:', error);
      throw error;
    }
  }
  
  /**
   * Récupère les versions d'un document spécifique
   */
  async getVersions(options: GetVersionsOptions): Promise<DocumentVersion[]> {
    try {
      const { documentId, limit, offset, sortDirection } = options;
      
      const params = new URLSearchParams();
      if (limit !== undefined) params.append('limit', limit.toString());
      if (offset !== undefined) params.append('offset', offset.toString());
      if (sortDirection) params.append('sortDirection', sortDirection);
      
      const url = `${this.apiUrl}/${documentId}?${params.toString()}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des versions:', error);
      return [];
    }
  }
  
  /**
   * Récupère une version spécifique d'un document
   */
  async getVersion(documentId: string, versionNumber: number): Promise<DocumentVersion | null> {
    try {
      const response = await axios.get(`${this.apiUrl}/${documentId}/${versionNumber}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la version:', error);
      return null;
    }
  }
  
  /**
   * Récupère la dernière version d'un document
   */
  async getLatestVersion(documentId: string): Promise<DocumentVersion | null> {
    try {
      const response = await axios.get(`${this.apiUrl}/${documentId}/latest`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération de la dernière version:', error);
      return null;
    }
  }
  
  /**
   * Compare deux versions d'un document
   */
  async compareVersions(
    documentId: string, 
    fromVersion: number, 
    toVersion: number
  ): Promise<VersionDiffResponse | null> {
    try {
      const url = `${this.apiUrl}/${documentId}/compare/${fromVersion}/${toVersion}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la comparaison des versions:', error);
      return null;
    }
  }
  
  /**
   * Restaure une version précédente d'un document
   */
  async restoreVersion(
    documentId: string, 
    versionNumber: number, 
    restoredBy: string, 
    comment?: string
  ): Promise<DocumentVersion | null> {
    try {
      const url = `${this.apiUrl}/${documentId}/restore/${versionNumber}`;
      const data = { restoredBy, comment };
      
      const response = await axios.post(url, data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la restauration de la version:', error);
      return null;
    }
  }
  
  /**
   * Supprime toutes les versions d'un document
   */
  async deleteAllVersions(documentId: string): Promise<boolean> {
    try {
      await axios.delete(`${this.apiUrl}/${documentId}`);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression des versions:', error);
      return false;
    }
  }
}

export default new DocumentVersionService();
