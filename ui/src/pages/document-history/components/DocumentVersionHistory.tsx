import React, { useState, useEffect } from 'react';
import { FiClock, FiUser, FiChevronDown, FiChevronUp, FiRefreshCw, FiRotateCcw } from 'react-icons/fi';
import documentVersionService from '../../../services/document-version.service';
import type { DocumentVersion } from '../../../types/document-version';
import type { ProcessedDocument } from '../../../types/document-history';

interface DocumentVersionHistoryProps {
  document: ProcessedDocument;
  onRestoreVersion?: (version: DocumentVersion) => void;
  className?: string;
}

const DocumentVersionHistory: React.FC<DocumentVersionHistoryProps> = ({
  document,
  onRestoreVersion,
  className = ''
}) => {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedVersions, setExpandedVersions] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (document.id) {
      loadVersions();
    }
  }, [document.id]);
  
  const loadVersions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await documentVersionService.getVersions({
        documentId: document.id,
        sortDirection: 'desc' // Plus récentes d'abord
      });
      
      setVersions(result);
    } catch (error) {
      console.error('Erreur lors du chargement des versions:', error);
      setError("Impossible de charger l'historique des versions");
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleVersionExpand = (versionId: string) => {
    setExpandedVersions(prev => ({
      ...prev,
      [versionId]: !prev[versionId]
    }));
  };
  
  const handleRestoreVersion = async (version: DocumentVersion) => {
    if (window.confirm(`Êtes-vous sûr de vouloir restaurer la version ${version.versionNumber} ?`)) {
      if (onRestoreVersion) {
        onRestoreVersion(version);
      }
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
      extractedData: 'Données extraites',
      selectedAccount: 'Compte sélectionné',
      tags: 'Tags',
      hasAccountingEntry: 'Écriture comptable',
      lastEditedAt: 'Date de modification',
      '_restoration': 'Restauration de version'
    };
    
    return fieldDescriptions[fieldName] || fieldName;
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center">
          <FiClock className="mr-2 text-indigo-600 dark:text-indigo-400" />
          Historique des versions
        </h3>
        <button 
          onClick={loadVersions}
          className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/20"
          title="Rafraîchir l'historique"
          disabled={isLoading}
        >
          <FiRefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      <div className="p-4">
        {error && (
          <div className="p-3 mb-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="flex justify-center p-6">
            <FiRefreshCw className="animate-spin text-indigo-600 dark:text-indigo-400 h-8 w-8" />
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 p-6">
            <p>Aucune version disponible</p>
            <p className="text-sm mt-1">Le document n'a pas encore été modifié depuis sa création.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {versions.map((version) => (
              <li key={version.id} className="py-4">
                <div 
                  className="flex justify-between items-start cursor-pointer"
                  onClick={() => toggleVersionExpand(version.id)}
                >
                  <div>
                    <div className="flex items-center">
                      <span className="font-medium text-indigo-600 dark:text-indigo-400">
                        Version {version.versionNumber}
                      </span>
                      {version.versionNumber === 1 && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded">
                          Original
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(version.createdAt)}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <FiUser className="mr-1 h-3 w-3" />
                      <span>{version.createdBy}</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {version.versionNumber > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRestoreVersion(version);
                        }}
                        className="mr-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-1 rounded flex items-center"
                        title="Restaurer cette version"
                      >
                        <FiRotateCcw className="mr-1 h-3 w-3" />
                        Restaurer
                      </button>
                    )}
                    {expandedVersions[version.id] ? (
                      <FiChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FiChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {expandedVersions[version.id] && (
                  <div className="mt-3 pl-4 border-l-2 border-indigo-200 dark:border-indigo-800">
                    <h4 className="text-sm font-medium mb-2">Commentaire</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {version.comment || 'Aucun commentaire'}
                    </p>
                    
                    {version.changes.length > 0 && (
                      <>
                        <h4 className="text-sm font-medium mb-2">Modifications</h4>
                        <ul className="space-y-2">
                          {version.changes.map((change, index) => (
                            <li key={index} className="text-sm">
                              <span className="font-medium">{getChangeDescription(change.field)}</span>
                              <span className="text-gray-500 dark:text-gray-400">
                                {' modifié le '}
                                {new Date(change.timestamp).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DocumentVersionHistory;
