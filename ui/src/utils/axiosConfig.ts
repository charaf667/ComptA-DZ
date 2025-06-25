import axios from 'axios';

// Configure Axios pour ajouter automatiquement le token JWT à chaque requête
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour traiter les erreurs de réponse (401, 403, etc.)
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si l'erreur est 401 (Unauthorized), cela signifie que le token est expiré ou invalide
    if (error.response && error.response.status === 401) {
      // On pourrait rediriger vers la page de connexion ou rafraîchir le token
      console.warn('Session expirée ou non authentifiée');
      
      // Option 1: Rediriger vers la page de connexion
      // window.location.href = '/login';
      
      // Option 2: Juste retourner l'erreur et laisser le composant la gérer
    }
    
    return Promise.reject(error);
  }
);

export default axios;
