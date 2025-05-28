import { useState } from 'react';
import { Link } from 'react-router-dom';
import authService from '../../services/authService';

/**
 * Page de récupération de mot de passe
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError('Veuillez saisir votre adresse email');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Appel au service d'authentification pour récupérer le mot de passe
      // Dans un environnement de production, cela enverrait un email avec un lien de réinitialisation
      await authService.forgotPassword(email);
      
      // Si la requête réussit, afficher le message de succès
      setSuccess(true);
      
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'envoi de l\'email de récupération. Veuillez réessayer.');
      console.error('Erreur de récupération:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-10">
        <h1 className="font-heading text-2xl font-bold text-primary-900 mb-2">Mot de passe oublié</h1>
        <p className="text-text-secondary">Nous vous enverrons un lien pour réinitialiser votre mot de passe</p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-error rounded-md">
          {error}
        </div>
      )}
      
      {success ? (
        <div className="text-center">
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-success rounded-md">
            Un email de récupération a été envoyé à <strong>{email}</strong>.
            <br />Veuillez vérifier votre boîte de réception et suivre les instructions.
          </div>
          <Link to="/auth/login" className="btn btn-primary inline-block">
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="form-label">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="votreemail@exemple.com"
              disabled={loading}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full flex justify-center"
          >
            {loading ? (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : 'Envoyer les instructions'}
          </button>
        </form>
      )}
      
      <p className="mt-8 text-center text-sm text-text-secondary">
        <Link to="/auth/login" className="text-primary-600 hover:text-primary-800 font-medium">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
};

export default ForgotPassword;
