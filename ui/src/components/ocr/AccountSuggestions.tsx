import React, { useState, useEffect } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAward, FiBookOpen, FiUser, FiDatabase, FiSearch } from 'react-icons/fi';
import ocrService from '../../services/ocr.service'; 

interface Account {
  id: string;
  code: string;
  label: string;
  type: string;
}

interface AccountSuggestion {
  compteCode: string;
  libelleCompte: string;
  classe?: number;
  scoreConfiance?: number;
  justification?: string;
  isManualSelection?: boolean;
}

interface AccountSuggestionsProps {
  suggestions: AccountSuggestion[];
  onSelectSuggestion: (suggestion: AccountSuggestion) => void;
  selectedSuggestion?: AccountSuggestion;
  isLoading?: boolean;
  tenantId: string; 
}

const AccountSuggestions: React.FC<AccountSuggestionsProps> = ({
  suggestions,
  onSelectSuggestion,
  selectedSuggestion,
  isLoading = false,
  tenantId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [manualSearchResults, setManualSearchResults] = useState<Account[]>([]);
  const [chartOfAccounts, setChartOfAccounts] = useState<Account[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);

  useEffect(() => {
    const fetchChartOfAccounts = async () => {
      setIsLoadingChart(true);
      try {
        const accounts = await ocrService.getAccounts(); 
        setChartOfAccounts(accounts || []);
      } catch (error) {
        console.error("Erreur lors du chargement du plan comptable:", error);
        setChartOfAccounts([]);
      } finally {
        setIsLoadingChart(false);
      }
    };

    if (tenantId) { 
        fetchChartOfAccounts();
    }
  }, [tenantId]);

  const getSuggestionSource = (justification?: string) => {
    if (!justification) return { icon: <FiUser className="mr-1" />, label: 'Sélection manuelle', description: 'Compte choisi manuellement', color: 'text-gray-500' };
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
    return {
      icon: <FiAward className="mr-1" />,
      label: 'Règle de classification',
      description: 'Basé sur les mots-clés identifiés',
      color: 'text-green-500'
    };
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    if (term.length > 1 && chartOfAccounts.length > 0) {
      const filteredAccounts = chartOfAccounts.filter(
        (account) =>
          account.code.toLowerCase().includes(term) ||
          account.label.toLowerCase().includes(term)
      );
      setManualSearchResults(filteredAccounts);
    } else {
      setManualSearchResults([]);
    }
  };

  const handleManualSelect = (account: Account) => {
    onSelectSuggestion({
      compteCode: account.code,
      libelleCompte: account.label,
      isManualSelection: true,
    });
    setSearchTerm('');
    setManualSearchResults([]);
  };

  if (isLoading || isLoadingChart) {
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
          {isLoadingChart && <p className="text-sm text-center mt-2">Chargement du plan comptable...</p>}
        </div>
      );
  }

  if (suggestions.length === 0 && searchTerm.length === 0 && chartOfAccounts.length === 0 && !isLoadingChart) {
    return (
        <div className="p-6 border rounded-lg bg-background dark:bg-background-dark shadow-sm">
          <h3 className="text-lg font-medium mb-4">Suggestions de comptes</h3>
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <FiAlertCircle className="text-3xl text-error mb-2" />
            <p className="text-text-secondary">
              Erreur lors du chargement du plan comptable. Impossible de rechercher ou de suggérer des comptes.
            </p>
          </div>
        </div>
      );
  }

  return (
    <div className="p-6 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      <h3 className="text-lg font-medium mb-4">Suggestions de comptes</h3>

      <div className="mb-4 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Rechercher un compte (code ou libellé)..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          disabled={isLoadingChart || chartOfAccounts.length === 0}
        />
        {manualSearchResults.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full border border-gray-300 rounded-md bg-white dark:bg-gray-700 shadow-lg max-h-60 overflow-y-auto">
            {manualSearchResults.map((account) => (
              <li
                key={account.id}
                onClick={() => handleManualSelect(account)}
                className="p-3 hover:bg-primary-50 dark:hover:bg-primary-900/20 cursor-pointer text-sm"
              >
                <span className="font-semibold">{account.code}</span> - {account.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {searchTerm.length === 0 && suggestions.length > 0 && (
        <>
        <p className="text-sm text-text-secondary mb-2">Suggestions de l'IA :</p>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => {
            const source = getSuggestionSource(suggestion.justification);
            const isSelectedByAI = selectedSuggestion?.compteCode === suggestion.compteCode && !selectedSuggestion?.isManualSelection;
            
            return (
              <div
                key={index}
                className={`p-3 border rounded-md cursor-pointer transition-all duration-150 ease-in-out 
                            ${isSelectedByAI ? 'border-primary-500 ring-2 ring-primary-500 bg-primary-50 dark:bg-primary-900/20 shadow-md' 
                                              : 'hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm'}`}
                onClick={() => onSelectSuggestion(suggestion)}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    <span className={`font-semibold text-md mr-2 ${isSelectedByAI ? 'text-primary-600 dark:text-primary-300' : ''}`}>{suggestion.compteCode}</span>
                    <span className={`text-text-primary font-medium ${isSelectedByAI ? 'text-primary-700 dark:text-primary-200' : ''}`}>{suggestion.libelleCompte}</span>
                  </div>
                  <div title={source.description} className={`flex items-center px-2 py-0.5 rounded-full text-xs ${source.color} bg-opacity-10 border ${source.color.replace('text-', 'border-')}/30`}>
                    {source.icon}
                    <span className="ml-1">{source.label}</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-text-secondary">
                    Classe {suggestion.classe}
                    {suggestion.scoreConfiance && ` · Confiance: ${(suggestion.scoreConfiance * 100).toFixed(0)}%`}
                  </span>
                </div>
                {suggestion.scoreConfiance !== undefined && (
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5 mb-2">
                        <div className={`${source.color.replace('text-','bg-')} h-1.5 rounded-full`} style={{ width: `${suggestion.scoreConfiance * 100}%` }}></div>
                    </div>
                )}
                <p className="text-xs text-text-secondary italic opacity-80">
                  {suggestion.justification}
                </p>
                {isSelectedByAI && (
                  <div className="flex items-center justify-center w-full mt-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 rounded-md text-sm">
                    <FiCheckCircle className="mr-1.5" />
                    <span className="font-medium">Sélectionné</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        </>
      )}
      
      {selectedSuggestion?.isManualSelection && (
        <div className="mt-4">
            <p className="text-sm text-text-secondary mb-2">Votre sélection :</p>
            <div className="p-3 border rounded-md bg-gray-50 dark:bg-gray-700/50 border-gray-400 dark:border-gray-500">
                <div className="flex justify-between items-center">
                    <div>
                        <span className="font-semibold text-md mr-2">{selectedSuggestion.compteCode}</span>
                        <span className="text-text-primary font-medium">{selectedSuggestion.libelleCompte}</span>
                    </div>
                    <div className="flex items-center px-2 py-0.5 rounded-full text-xs text-gray-500 bg-gray-100 dark:bg-gray-600 border border-gray-300 dark:border-gray-500">
                        <FiUser className="mr-1" />
                        <span>Sélection manuelle</span>
                    </div>
                </div>
            </div>
        </div>
      )}

      {searchTerm.length === 0 && suggestions.length === 0 && chartOfAccounts.length > 0 && (
         <div className="text-center text-text-secondary py-6">
            <FiInfo size={24} className="mx-auto mb-2 text-gray-400"/>
            <p>Aucune suggestion automatique de l'IA.</p>
            <p className="text-sm">Utilisez la barre de recherche ci-dessus pour trouver et sélectionner un compte manuellement.</p>
         </div>
      )}
    </div>
  );
};

export default AccountSuggestions;
