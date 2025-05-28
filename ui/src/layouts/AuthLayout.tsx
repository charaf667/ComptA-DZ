import { Outlet } from 'react-router-dom';

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
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
