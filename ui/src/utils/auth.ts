/**
 * Utilitaires d'authentification pour l'application ComptaDZ
 */

/**
 * Récupère le token JWT du localStorage
 * @returns Le token JWT ou null si non présent
 */
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

/**
 * Récupère les en-têtes HTTP avec le token d'authentification JWT
 * @returns Un objet contenant les en-têtes d'authentification
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    return {
      Authorization: `Bearer ${token}`
    };
  }
  
  return {};
};

/**
 * Vérifie si l'utilisateur est authentifié
 * @returns true si un token est présent dans le localStorage
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('auth_token');
};

/**
 * Récupère les informations de l'utilisateur stockées dans le localStorage
 * @returns Les informations de l'utilisateur ou null si non authentifié
 */
export const getUserInfo = () => {
  const userStr = localStorage.getItem('auth_user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch (e) {
      console.error('Erreur lors du parsing des informations utilisateur:', e);
      return null;
    }
  }
  return null;
};
