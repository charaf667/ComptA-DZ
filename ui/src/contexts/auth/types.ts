/**
 * Types pour le contexte d'authentification
 */

// Type pour l'utilisateur connecté
export interface User {
  id: string;
  nom: string;
  email: string;
  role: 'ADMIN' | 'COMPTABLE' | 'ASSISTANT';
  tenantId: string;
}

// Type pour les informations de tenant
export interface Tenant {
  id: string;
  nom: string;
}

// Type pour le contexte d'authentification
export interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

// Type pour les données d'inscription
export interface RegisterData {
  nom: string;
  email: string;
  password: string;
  tenantId?: string;
  nomEntreprise?: string; // Pour la création d'un nouveau tenant
}

// Type pour la réponse d'authentification de l'API
export interface AuthResponse {
  token: string;
  user: User;
  tenant?: Tenant;
  message: string;
}
