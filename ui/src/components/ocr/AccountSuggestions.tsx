import React from 'react';
import { FiCheckCircle, FiAlertCircle, FiPercent, FiInfo, FiAward, FiBookOpen, FiUser, FiDatabase } from 'react-icons/fi';

interface AccountSuggestion {
  compteCode: string;
  libelleCompte: string;
  classe: number;
  scoreConfiance: number;
  justification: string;
}

interface AccountSuggestionsProps {
  suggestions: AccountSuggestion[];
  onSelectSuggestion: (suggestion: AccountSuggestion) => void;
  selectedSuggestion?: AccountSuggestion;
  isLoading?: boolean;
}

const AccountSuggestions: React.FC<AccountSuggestionsProps> = ({
  suggestions,
  onSelectSuggestion,
  selectedSuggestion,
  isLoading = false
}) => {
  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-success';
    if (score >= 0.5) return 'text-warning';
    return 'text-error';
  };
  
  // Détermine la source de la suggestion en fonction de la justification
  const getSuggestionSource = (justification: string) => {
    if (justification.includes('Apprentissage')) {
      return {
        icon: <FiUser className="mr-1" />,
        label: 'Apprentissage adaptatif',
        description: 'Basé sur vos choix précédents',
        color: 'text-purple-500'
      };
    }
    if (justification.includes('Fournisseur')) {
      return {
        icon: <FiDatabase className="mr-1" />,
        label: 'Fournisseur identifié',
        description: 'Basé sur le nom du fournisseur',
        color: 'text-blue-500'
      };
    }
    if (justification.includes('référence')) {
      return {
        icon: <FiBookOpen className="mr-1" />,
        label: 'Format de référence',
        description: 'Basé sur le format de la référence',
        color: 'text-teal-500'
      };
    }
    if (justification.includes('Montant')) {
      return {
        icon: <FiInfo className="mr-1" />,
        label: 'Montant significatif',
        description: 'Basé sur le montant de la facture',
        color: 'text-amber-500'
      };
    }
    // Par défaut, c'est une règle basée sur les mots-clés
    return {
      icon: <FiAward className="mr-1" />,
      label: 'Règle de classification',
      description: 'Basé sur les mots-clés identifiés',
      color: 'text-green-500'
    };
  };

  if (isLoading) {
    return (
      <div className="p-6 border rounded-lg bg-background dark:bg-background-dark shadow-sm animate-pulse">
        <h3 className="text-lg font-medium mb-4">Suggestions de comptes</h3>
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="p-4 border rounded-md">
              <div className="h-5 bg-secondary dark:bg-gray-700 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-secondary dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-secondary dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="p-6 border rounded-lg bg-background dark:bg-background-dark shadow-sm">
        <h3 className="text-lg font-medium mb-4">Suggestions de comptes</h3>
        <div className="flex flex-col items-center justify-center p-6 text-center">
          <FiAlertCircle className="text-3xl text-warning mb-2" />
          <p className="text-text-secondary">
            Aucune suggestion de compte disponible. Essayez de modifier les données extraites ou d'uploader un document plus clair.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      <h3 className="text-lg font-medium mb-4">Suggestions de comptes</h3>
      <div className="space-y-4">
        {suggestions.map((suggestion, index) => {
          const source = getSuggestionSource(suggestion.justification);
          return (
            <div
              key={index}
              className={`p-4 border rounded-md cursor-pointer transition-colors ${
                selectedSuggestion?.compteCode === suggestion.compteCode
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10'
                  : 'hover:border-gray-400 dark:hover:border-gray-600'
              }`}
              onClick={() => onSelectSuggestion(suggestion)}
            >
              {/* Badge de source en haut à droite */}
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center">
                  <span className="font-semibold text-lg mr-2">{suggestion.compteCode}</span>
                  <span className="text-text-primary font-medium">{suggestion.libelleCompte}</span>
                </div>
                <div className={`flex items-center px-2 py-1 rounded-full text-xs ${source.color} bg-opacity-10 border border-opacity-20`}>
                  {source.icon}
                  <span>{source.label}</span>
                </div>
              </div>
              
              {/* Score de confiance et détails */}
              <div className="flex flex-col space-y-2">
                {/* Barre de progression du score de confiance */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-1">
                  <div 
                    className={`${getConfidenceColor(suggestion.scoreConfiance)} h-2 rounded-full`} 
                    style={{ width: `${Math.round(suggestion.scoreConfiance * 100)}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">
                    Classe {suggestion.classe} · {source.description}
                  </span>
                  <span className={`${getConfidenceColor(suggestion.scoreConfiance)} font-medium flex items-center`}>
                    <FiPercent className="mr-1" size={14} />
                    {Math.round(suggestion.scoreConfiance * 100)}
                  </span>
                </div>
              </div>
              
              {/* Justification plus détaillée */}
              <p className="mt-2 text-xs text-text-secondary italic">
                {suggestion.justification}
              </p>
              
              {selectedSuggestion?.compteCode === suggestion.compteCode && (
                <div className="flex items-center justify-center w-full mt-3 py-2 bg-primary-100 dark:bg-primary-900/20 text-primary-500 rounded-md">
                  <FiCheckCircle className="mr-2" />
                  <span className="font-medium">Suggestion sélectionnée</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AccountSuggestions;
