import React, { useState } from 'react';
import { FiFileText, FiCheck, FiX } from 'react-icons/fi';
import type { ProcessedDocument } from '../../../types/document-history';

interface AccountingEntryGeneratorProps {
  document: ProcessedDocument;
  onClose: () => void;
  onSuccess: () => void;
}

const AccountingEntryGenerator: React.FC<AccountingEntryGeneratorProps> = ({
  document,
  onClose,
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Générer l'écriture comptable
  const generateAccountingEntry = async () => {
    if (!document.selectedAccount) {
      setError("Aucun compte sélectionné pour ce document");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Appel API pour générer l'écriture comptable
      const response = await fetch(`${import.meta.env.VITE_API_URL}/accounting-entries/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id,
          accountCode: document.selectedAccount.compteCode,
          amount: document.extractedData.montant,
          supplier: document.extractedData.fournisseur,
          date: document.extractedData.date || document.processedAt,
          description: `Facture ${document.extractedData.reference || document.filename}`
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la génération de l\'écriture comptable');
      }
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Générer une écriture comptable
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Document source
            </h4>
            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md">
              <div className="flex items-center">
                <FiFileText className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mr-2" />
                <span className="text-sm text-gray-800 dark:text-gray-200">{document.filename}</span>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Détails de l'écriture
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Compte</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {document.selectedAccount?.compteCode} - {document.selectedAccount?.libelleCompte}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Montant</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {document.extractedData.montant?.toFixed(2)} DZD
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Fournisseur</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {document.extractedData.fournisseur || 'Non spécifié'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Date</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                  {new Date(document.extractedData.date || document.processedAt).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {success ? (
            <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-md text-sm flex items-center">
              <FiCheck className="h-5 w-5 mr-2" />
              Écriture comptable générée avec succès !
            </div>
          ) : (
            <div className="flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                onClick={generateAccountingEntry}
                disabled={isLoading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full" />
                    Génération...
                  </span>
                ) : (
                  'Générer l\'écriture'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountingEntryGenerator;
