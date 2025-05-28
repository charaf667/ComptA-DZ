// React est utilisé implicitement dans les composants JSX
import { Link } from 'react-router-dom';

/**
 * Page d'accueil pour les visiteurs non-connectés
 */
const LandingPage = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="text-primary-900 font-bold text-2xl font-heading">ComptaDZ</div>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth/login" className="text-primary-600 hover:text-primary-900 font-medium">
                Connexion
              </Link>
              <Link to="/auth/register" className="btn btn-primary">
                S'inscrire
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-primary-900 to-primary-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
                Automatisez votre comptabilité et gagnez du temps
              </h1>
              <p className="text-xl mb-8 text-primary-50">
                ComptaDZ est une solution SaaS qui simplifie la gestion comptable des PME algériennes grâce à l'intelligence artificielle.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link to="/auth/register" className="btn bg-white text-primary-900 hover:bg-primary-50 py-3 px-6 rounded-lg font-medium text-center">
                  Commencer gratuitement
                </Link>
                <a href="#fonctionnalites" className="btn bg-primary-800 text-white hover:bg-primary-800/90 py-3 px-6 rounded-lg font-medium text-center">
                  En savoir plus
                </a>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="/img/hero-illustration.svg" 
                alt="ComptaDZ Illustration" 
                className="w-full max-w-md mx-auto"
                onError={(e) => {
                  // Fallback si l'image n'est pas trouvée
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.style.display = 'none';
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctionnalites" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-heading text-primary-900 mb-4">Fonctionnalités principales</h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              Découvrez comment ComptaDZ peut transformer votre gestion comptable et vous faire gagner des heures chaque mois.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 bg-background rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold font-heading text-primary-900 mb-2">Saisie automatique OCR</h3>
              <p className="text-text-secondary">
                Numérisez vos factures et laissez notre technologie OCR extraire automatiquement les données importantes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-background rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold font-heading text-primary-900 mb-2">Tableaux de bord intelligents</h3>
              <p className="text-text-secondary">
                Visualisez vos données financières grâce à des tableaux de bord intuitifs et personnalisables.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-background rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold font-heading text-primary-900 mb-2">Gestion de TVA</h3>
              <p className="text-text-secondary">
                Calculez automatiquement la TVA et préparez vos déclarations fiscales en quelques clics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-heading text-primary-900 mb-4">Tarification simple et transparente</h2>
            <p className="text-lg text-text-secondary max-w-3xl mx-auto">
              Choisissez le forfait qui correspond le mieux aux besoins de votre entreprise.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Plan 1 */}
            <div className="p-8 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-xl font-bold font-heading text-primary-900 mb-2">Démarrage</h3>
              <p className="text-text-secondary mb-4">Idéal pour les auto-entrepreneurs</p>
              <div className="text-4xl font-bold text-primary-900 mb-6">5 000 DA<span className="text-sm font-normal text-text-secondary">/mois</span></div>
              
              <ul className="mb-8 space-y-3 flex-grow">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-success mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Jusqu'à 50 factures par mois</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-success mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>OCR de base</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-success mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>1 utilisateur</span>
                </li>
              </ul>
              
              <Link to="/auth/register" className="btn btn-outline w-full">S'inscrire</Link>
            </div>

            {/* Plan 2 */}
            <div className="p-8 bg-white rounded-lg shadow-lg border-2 border-primary-500 flex flex-col relative">
              <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">Populaire</div>
              <h3 className="text-xl font-bold font-heading text-primary-900 mb-2">Business</h3>
              <p className="text-text-secondary mb-4">Pour les PME en croissance</p>
              <div className="text-4xl font-bold text-primary-900 mb-6">15 000 DA<span className="text-sm font-normal text-text-secondary">/mois</span></div>
              
              <ul className="mb-8 space-y-3 flex-grow">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-success mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Factures illimitées</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-success mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>OCR avancé</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-success mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Jusqu'à 5 utilisateurs</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-success mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Rapports avancés</span>
                </li>
              </ul>
              
              <Link to="/auth/register" className="btn btn-primary w-full">S'inscrire</Link>
            </div>

            {/* Plan 3 */}
            <div className="p-8 bg-white rounded-lg shadow-sm border border-gray-100 flex flex-col">
              <h3 className="text-xl font-bold font-heading text-primary-900 mb-2">Entreprise</h3>
              <p className="text-text-secondary mb-4">Pour les grandes entreprises</p>
              <div className="text-4xl font-bold text-primary-900 mb-6">Sur mesure</div>
              
              <ul className="mb-8 space-y-3 flex-grow">
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-success mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Toutes les fonctionnalités Business</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-success mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Utilisateurs illimités</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-success mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Intégration ERP personnalisée</span>
                </li>
                <li className="flex items-center">
                  <svg className="h-5 w-5 text-success mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Support dédié</span>
                </li>
              </ul>
              
              <Link to="/contact" className="btn btn-outline w-full">Nous contacter</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-heading mb-6">Prêt à simplifier votre comptabilité ?</h2>
          <p className="text-xl mb-8 text-primary-100 max-w-3xl mx-auto">
            Rejoignez plus de 500 entreprises qui font confiance à ComptaDZ pour leur gestion comptable.
          </p>
          <Link to="/auth/register" className="btn bg-white text-primary-900 hover:bg-primary-50 py-3 px-8 rounded-lg font-medium text-lg">
            Commencer gratuitement
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-heading font-bold mb-4">ComptaDZ</h3>
              <p className="text-gray-400">
                Solution moderne de comptabilité pour les entreprises algériennes.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-4">Produit</h4>
              <ul className="space-y-2">
                <li><a href="#fonctionnalites" className="text-gray-400 hover:text-white">Fonctionnalités</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Tarifs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-4">Entreprise</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">À propos</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Carrières</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-medium mb-4">Légal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Conditions d'utilisation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Politique de confidentialité</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Mentions légales</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} ComptaDZ. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
