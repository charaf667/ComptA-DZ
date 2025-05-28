import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios';

// Configuration de base pour Axios
// Utilisation du port 4000 pour correspondre au serveur backend
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Création d'une instance Axios avec la configuration de base
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur de requête pour ajouter le token d'authentification
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('auth_token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse pour gérer les erreurs
api.interceptors.response.use(
  (response: AxiosResponse): AxiosResponse => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Gérer les erreurs 401 (non autorisé)
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Si c'est une erreur d'authentification et qu'on n'a pas déjà essayé de rafraîchir le token
      originalRequest._retry = true;
      
      // Dans un système réel, on pourrait essayer de rafraîchir le token ici
      // Pour le moment, on se déconnecte simplement
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_tenant');
      
      // Redirection vers la page de connexion
      window.location.href = '/login';
    }
    
    // Renvoi de l'erreur pour la traiter ailleurs
    return Promise.reject(error);
  }
);

export default api;
