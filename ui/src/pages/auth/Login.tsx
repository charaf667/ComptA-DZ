import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';

/**
 * Page de connexion
 */
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [localError, setLocalError] = useState('');
  
  const { login, isLoading, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setLocalError('Veuillez remplir tous les champs');
      return;
    }
    
    try {
      // Effacer les erreurs précédentes
      setLocalError('');
      clearError();
      
      // Appeler la fonction de connexion du contexte d'authentification
      await login(email, password);
      
      // Si la connexion réussit, rediriger vers le dashboard
      navigate('/');
    } catch (err: any) {
      // L'erreur est déjà gérée par le contexte d'authentification
      setLocalError(err.message || 'Identifiants incorrects. Veuillez réessayer.');
      console.error('Erreur de connexion:', err);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-heading font-bold text-primary-900 mb-6">Connexion</h2>
      <p className="mb-8 text-text-secondary">Bienvenue sur ComptaDZ. Connectez-vous pour continuer.</p>
      
      {(localError || authError) && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 text-error rounded-md">
          {localError || authError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="form-label">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-input"
            placeholder="exemple@email.com"
            disabled={isLoading}
            required
          />
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="password" className="form-label">Mot de passe</label>
            <Link to="/auth/forgot-password" className="text-sm text-primary-600 hover:text-primary-800">
              Mot de passe oublié ?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            placeholder="********"
            disabled={isLoading}
            required
          />
        </div>
        
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            className="h-4 w-4 text-primary-600 border-gray-300 rounded"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            disabled={isLoading}
          />
          <label htmlFor="remember-me" className="ml-2 block text-sm text-text-primary">
            Se souvenir de moi
          </label>
        </div>
        
        <button
          type="submit"
          className="btn btn-primary w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Connexion en cours...
            </>
          ) : 'Se connecter'}
        </button>
      </form>
      
      <p className="mt-8 text-center text-sm text-text-secondary">
        Pas encore de compte?{' '}
        <Link to="/auth/register" className="text-primary-600 hover:text-primary-800 font-medium">
          Créer un compte
        </Link>
      </p>
    </div>
  );
};

export default Login;
