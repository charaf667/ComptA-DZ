import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Importer les composants de page d'authentification
const Login = lazy(() => import('../pages/auth/Login').catch(error => {
  console.error('Erreur de chargement du module Login:', error);
  return { default: () => <div>Erreur de chargement de la page de connexion</div> };
}));
const Register = lazy(() => import('../pages/auth/Register').catch(error => {
  console.error('Erreur de chargement du module Register:', error);
  return { default: () => <div>Erreur de chargement de la page d\'inscription</div> };
}));
const ForgotPassword = lazy(() => import('../pages/auth/ForgotPassword').catch(error => {
  console.error('Erreur de chargement du module ForgotPassword:', error);
  return { default: () => <div>Erreur de chargement de la page de récupération de mot de passe</div> };
}));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
  </div>
);

/**
 * Layout pour les pages d'authentification
 * Fournit un design simple et épuré pour le login, register, etc.
 */
const AuthLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Colonne de gauche avec image/logo */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary-900 flex-col items-center justify-center p-12 text-white">
        <div className="max-w-md">
          <h1 className="text-4xl font-heading font-bold mb-6">ComptaDZ</h1>
          <p className="text-xl mb-8">
            Solution SaaS pour l'automatisation de la comptabilité des PME algériennes
          </p>
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="rounded-full bg-primary-700 p-2 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>Saisie automatique de factures (OCR)</p>
            </div>
            <div className="flex items-center">
              <div className="rounded-full bg-primary-700 p-2 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>Génération d'écritures IFRS</p>
            </div>
            <div className="flex items-center">
              <div className="rounded-full bg-primary-700 p-2 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p>Déclarations fiscales automatisées</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Colonne droite avec le formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="forgot-password" element={<ForgotPassword />} />
              <Route index element={<Navigate to="login" replace />} />
              <Route path="*" element={<Navigate to="login" replace />} /> {/* Redirection pour toute sous-route inconnue de /auth */}
            </Routes>
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
