import api from './api';
import type { User } from '../contexts/auth/types';

// Type pour les données de mise à jour du profil
export interface UserUpdateData {
  nom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
}

// Type pour le changement de mot de passe
export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Service de gestion des utilisateurs
 */
class UserService {
  /**
   * Récupérer le profil de l'utilisateur connecté
   * @returns Une promesse contenant les données de l'utilisateur
   */
  async getProfile(): Promise<User> {
    try {
      const response = await api.get<User>('/users/profile');
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Échec de la récupération du profil');
      }
      throw new Error('Impossible de se connecter au serveur');
    }
  }

  /**
   * Mettre à jour le profil de l'utilisateur
   * @param data - Données de mise à jour du profil
   * @returns Une promesse contenant l'utilisateur mis à jour
   */
  async updateProfile(data: UserUpdateData): Promise<User> {
    try {
      const response = await api.put<User>('/users/profile', data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Échec de la mise à jour du profil');
      }
      throw new Error('Impossible de se connecter au serveur');
    }
  }

  /**
   * Changer le mot de passe de l'utilisateur
   * @param data - Données de changement de mot de passe
   * @returns Une promesse contenant un message de succès
   */
  async changePassword(data: PasswordChangeData): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/users/change-password', data);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Échec du changement de mot de passe');
      }
      throw new Error('Impossible de se connecter au serveur');
    }
  }

  /**
   * Télécharger un avatar d'utilisateur
   * @param file - Fichier d'avatar
   * @returns Une promesse contenant l'URL de l'avatar mis à jour
   */
  async uploadAvatar(file: File): Promise<{ avatarUrl: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await api.post<{ avatarUrl: string }>('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Échec du téléchargement de l\'avatar');
      }
      throw new Error('Impossible de se connecter au serveur');
    }
  }
}

export default new UserService();
