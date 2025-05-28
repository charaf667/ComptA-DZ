import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';

/**
 * Page d'inscription
 */
const Register = () => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    password: '',
    confirmPassword: '',
    nomEntreprise: '',
    acceptTerms: false
  });
  const [localError, setLocalError] = useState('');
  
  const { register, isLoading, error: authError, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation basique
    if (!formData.nom || !formData.email || !formData.password || !formData.nomEntreprise) {
      setLocalError('Veuillez remplir tous les champs obligatoires');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas');
      return;
    }
    
    if (!formData.acceptTerms) {
      setLocalError('Vous devez accepter les conditions d\'utilisation');
      return;
    }
    
    try {
      // Effacer les erreurs précédentes
      setLocalError('');
      clearError();
      
      // Préparer les données pour l'inscription
      const userData = {
        nom: formData.nom,
        email: formData.email,
        password: formData.password,
        nomEntreprise: formData.nomEntreprise
      };
      
      // Appeler la fonction d'inscription du contexte d'authentification
      await register(userData);
      
      // Redirection vers la page de connexion après inscription réussie
      navigate('/auth/login', { state: { message: 'Inscription réussie ! Vous pouvez maintenant vous connecter.' } });
    } catch (err: any) {
      // L'erreur est déjà gérée par le contexte d'authentification
      setLocalError(err.message || 'Erreur lors de l\'inscription. Veuillez réessayer.');
      console.error('Erreur d\'inscription:', err);
    }
  };

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="font-heading text-2xl font-bold text-primary-900 mb-2">Créer un compte</h1>
        <p className="text-text-secondary">Inscrivez-vous pour commencer à utiliser ComptaDZ</p>
      </div>
      
      {(localError || authError) && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-error rounded-md">
          {localError || authError}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* Informations personnelles */}
          <div>
            <label htmlFor="nom" className="form-label">Nom complet</label>
            <input
              id="nom"
              name="nom"
              type="text"
              value={formData.nom}
              onChange={handleChange}
              className="form-input"
              placeholder="Votre nom"
              disabled={isLoading}
              required
            />
          </div>
          
          <div>
            <label htmlFor="email" className="form-label">Email professionnel</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="votreemail@entreprise.com"
              disabled={isLoading}
              required
            />
          </div>
          
          {/* Mot de passe */}
          <div>
            <label htmlFor="password" className="form-label">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="form-input"
              placeholder="••••••••"
              disabled={isLoading}
              required
            />
          </div>
          
          <div>
            <label htmlFor="confirmPassword" className="form-label">Confirmer le mot de passe</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="form-input"
              placeholder="••••••••"
              disabled={isLoading}
              required
            />
          </div>
          
          {/* Informations entreprise */}
          <div>
            <label htmlFor="nomEntreprise" className="form-label">Nom de l'entreprise</label>
            <input
              id="nomEntreprise"
              name="nomEntreprise"
              type="text"
              value={formData.nomEntreprise}
              onChange={handleChange}
              className="form-input"
              placeholder="Nom de votre entreprise"
              disabled={isLoading}
              required
            />
          </div>
        </div>
        
        {/* Conditions */}
        <div className="flex items-start mt-4">
          <input
            id="acceptTerms"
            name="acceptTerms"
            type="checkbox"
            checked={formData.acceptTerms}
            onChange={handleChange}
            className="h-4 w-4 mt-1 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            required
          />
          <label htmlFor="acceptTerms" className="ml-2 block text-sm text-text-secondary">
            J'accepte les <a href="#" className="text-primary-600 hover:text-primary-800">conditions d'utilisation</a> et la <a href="#" className="text-primary-600 hover:text-primary-800">politique de confidentialité</a>
          </label>
        </div>
        
        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full flex justify-center mt-6"
        >
          {isLoading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : 'Créer mon compte'}
        </button>
      </form>
      
      <p className="mt-8 text-center text-sm text-text-secondary">
        Vous avez déjà un compte?{' '}
        <Link to="/auth/login" className="text-primary-600 hover:text-primary-800 font-medium">
          Se connecter
        </Link>
      </p>
    </div>
  );
};

export default Register;
