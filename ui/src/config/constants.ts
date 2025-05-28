/**
 * Constantes de configuration pour l'application
 */

// URL de base de l'API
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Constantes pour la pagination
export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE = 1;

// Constantes pour les types de notifications
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

// Constantes pour les thèmes
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};
