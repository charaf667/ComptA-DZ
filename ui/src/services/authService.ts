import api from './api';
import type { AuthResponse, RegisterData } from '../contexts/auth/types';

/**
 * Service d'authentification pour gérer les interactions avec l'API
 */
class AuthService {
  /**
   * Connecter un utilisateur
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe de l'utilisateur
   * @returns Une promesse contenant la réponse d'authentification
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Échec de la connexion');
      }
      throw new Error('Impossible de se connecter au serveur');
    }
  }

  /**
   * Inscrire un nouvel utilisateur
   * @param userData - Données d'inscription de l'utilisateur
   * @returns Une promesse contenant la réponse d'inscription
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Échec de l\'inscription');
      }
      throw new Error('Impossible de se connecter au serveur');
    }
  }

  /**
   * Demander un email de réinitialisation de mot de passe
   * @param email - Email de l'utilisateur
   * @returns Une promesse contenant le message de succès
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Échec de l\'envoi');
      }
      throw new Error('Impossible de se connecter au serveur');
    }
  }

  /**
   * Réinitialiser le mot de passe avec un token
   * @param token - Token de réinitialisation
   * @param newPassword - Nouveau mot de passe
   * @returns Une promesse contenant le message de succès
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/auth/reset-password', {
        token,
        password: newPassword
      });
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Échec de la réinitialisation');
      }
      throw new Error('Impossible de se connecter au serveur');
    }
  }

  /**
   * Vérifier le token d'authentification
   * @returns Une promesse contenant la réponse d'authentification
   */
  async verifyToken(): Promise<AuthResponse> {
    try {
      const response = await api.get<AuthResponse>('/auth/verify');
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(error.response.data.message || 'Token invalide');
      }
      throw new Error('Impossible de se connecter au serveur');
    }
  }
}

export default new AuthService();
