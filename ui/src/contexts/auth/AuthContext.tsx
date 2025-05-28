import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthContextType, User, Tenant, RegisterData } from './types';

// Création du contexte d'authentification
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
  }
  return context;
};

// Props pour le provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider du contexte d'authentification
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier si l'utilisateur est connecté au chargement de l'application
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Récupérer le token depuis le stockage local
        const token = localStorage.getItem('auth_token');
        
        if (!token) {
          setIsLoading(false);
          return;
        }
        
        // TODO: Vérifier la validité du token avec l'API
        // Pour le moment, on simule un utilisateur connecté si le token existe
        const storedUser = localStorage.getItem('auth_user');
        const storedTenant = localStorage.getItem('auth_tenant');
        
        if (storedUser && storedTenant) {
          setUser(JSON.parse(storedUser));
          setTenant(JSON.parse(storedTenant));
          setIsAuthenticated(true);
        }
        
      } catch (err) {
        console.error('Erreur lors de la vérification de l\'authentification:', err);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_tenant');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Connexion
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: Connecter avec l'API backend
      // Pour le moment, on simule une connexion réussie
      // Notez que le mot de passe est simplement vérifié localement pour la démo
      // Dans une implémentation réelle, cela serait fait côté serveur
      if (password.length < 6) {
        throw new Error("Le mot de passe doit contenir au moins 6 caractères");
      }
      
      const response = await new Promise<any>(resolve => {
        setTimeout(() => {
          resolve({
            token: 'fake_token_123',
            user: {
              id: '1',
              nom: 'Utilisateur Test',
              email,
              role: 'ADMIN' as const,
              tenantId: '1'
            },
            tenant: {
              id: '1',
              nom: 'Entreprise Test'
            }
          });
        }, 1000);
      });
      
      // Stocker les informations d'authentification
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
      localStorage.setItem('auth_tenant', JSON.stringify(response.tenant));
      
      setUser(response.user);
      setTenant(response.tenant);
      setIsAuthenticated(true);
      
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      setError(err.message || 'Erreur lors de la connexion');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Inscription
  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // TODO: S'inscrire avec l'API backend
      // Pour le moment, on simule une inscription réussie avec validation minimale
      if (!userData.nom || !userData.email || !userData.password) {
        throw new Error("Tous les champs sont obligatoires");
      }
      
      if (userData.password.length < 8) {
        throw new Error("Le mot de passe doit contenir au moins 8 caractères");
      }
      
      // Simulation de délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Note: Dans une implémentation réelle, on retournerait à la page de connexion
      // après l'inscription réussie, plutôt que de connecter automatiquement l'utilisateur
      
    } catch (err: any) {
      console.error('Erreur d\'inscription:', err);
      setError(err.message || 'Erreur lors de l\'inscription');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Déconnexion
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_tenant');
    
    setUser(null);
    setTenant(null);
    setIsAuthenticated(false);
    
    // Rediriger vers la page de connexion (sera géré par le routeur)
  };

  // Effacer les erreurs
  const clearError = () => {
    setError(null);
  };

  // Valeur du contexte
  const contextValue: AuthContextType = {
    user,
    tenant,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
