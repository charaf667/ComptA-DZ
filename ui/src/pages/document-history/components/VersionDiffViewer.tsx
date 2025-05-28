import React, { useState, useEffect } from 'react';
import { FiFilePlus, FiFileMinus, FiArrowRight, FiEdit } from 'react-icons/fi';
import documentVersionService from '../../../services/document-version.service';
import type { DocumentVersion, VersionDiffResponse } from '../../../types/document-version';

interface VersionDiffViewerProps {
  documentId: string;
  fromVersion: number;
  toVersion: number;
  onClose?: () => void;
  className?: string;
}

const VersionDiffViewer: React.FC<VersionDiffViewerProps> = ({
  documentId,
  fromVersion,
  toVersion,
  onClose,
  className = ''
}) => {
  const [diffData, setDiffData] = useState<VersionDiffResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (documentId && fromVersion && toVersion) {
      loadDiff();
    }
  }, [documentId, fromVersion, toVersion]);
  
  const loadDiff = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await documentVersionService.compareVersions(
        documentId,
        fromVersion,
        toVersion
      );
      
      setDiffData(result);
    } catch (error) {
      console.error('Erreur lors du chargement des différences:', error);
      setError('Impossible de charger les différences entre les versions');
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getChangeDescription = (fieldName: string): string => {
    const fieldDescriptions: Record<string, string> = {
      filename: 'Nom du fichier',
      'extractedData.fournisseur': 'Fournisseur',
      'extractedData.montant': 'Montant',
      'extractedData.date': 'Date du document',
      'extractedData.reference': 'Référence',
      selectedAccount: 'Compte sélectionné',
      'selectedAccount.compteCode': 'Code du compte',
      'selectedAccount.libelleCompte': 'Libellé du compte',
      tags: 'Tags',
      hasAccountingEntry: 'Écriture comptable',
      lastEditedAt: 'Date de modification',
      '_restoration': 'Restauration de version'
    };
    
    return fieldDescriptions[fieldName] || fieldName;
  };
  
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'Non défini';
    }
    
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch (e) {
        return 'Objet complexe';
      }
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Oui' : 'Non';
    }
    
    return String(value);
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center">
          <FiEdit className="mr-2 text-indigo-600 dark:text-indigo-400" />
          Différences entre versions
        </h3>
        {onClose && (
          <button 
            onClick={onClose}
            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/20"
            title="Fermer"
          >
            &times;
          </button>
        )}
      </div>
      
      <div className="p-4">
        {error && (
          <div className="p-3 mb-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center p-6">
            <div className="animate-spin h-8 w-8 border-4 border-indigo-600 dark:border-indigo-400 rounded-full border-t-transparent"></div>
          </div>
        ) : !diffData ? (
          <div className="text-center text-gray-500 dark:text-gray-400 p-6">
            <p>Aucune différence disponible</p>
          </div>
        ) : (
          <>
            <div className="mb-4 text-center">
              <div className="flex items-center justify-center text-sm">
                <span className="font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded">
                  Version {diffData.fromVersion}
                </span>
                <FiArrowRight className="mx-2 text-gray-500 dark:text-gray-400" />
                <span className="font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded">
                  Version {diffData.toVersion}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Modifications du {formatDate(diffData.createdAt)} par {diffData.createdBy}
              </div>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mt-4">
              <h4 className="text-sm font-medium mb-3">Modifications détaillées</h4>
              
              {diffData.changes.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Aucune modification détectée entre ces versions
                </p>
              ) : (
                <ul className="space-y-4">
                  {diffData.changes.map((change, index) => (
                    <li key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 font-medium text-sm">
                        {getChangeDescription(change.field)}
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="flex items-start">
                          <div className="mt-0.5 mr-2">
                            <FiFileMinus className="h-4 w-4 text-red-500 dark:text-red-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ancienne valeur:</div>
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-2 rounded text-sm font-mono break-all whitespace-pre-wrap">
                              {formatValue(change.previousValue)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className="mt-0.5 mr-2">
                            <FiFilePlus className="h-4 w-4 text-green-500 dark:text-green-400" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Nouvelle valeur:</div>
                            <div className="bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 p-2 rounded text-sm font-mono break-all whitespace-pre-wrap">
                              {formatValue(change.newValue)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VersionDiffViewer;
