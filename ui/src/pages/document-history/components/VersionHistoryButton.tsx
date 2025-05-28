import React, { useState } from 'react';
import { FiClock, FiX } from 'react-icons/fi';
import type { ProcessedDocument } from '../../../types/document-history';
import DocumentVersionHistory from './DocumentVersionHistory';
import VersionDiffViewer from './VersionDiffViewer';
import type { DocumentVersion } from '../../../types/document-version';

interface VersionHistoryButtonProps {
  document: ProcessedDocument;
  onRestore?: (document: ProcessedDocument, version: DocumentVersion) => void;
}

const VersionHistoryButton: React.FC<VersionHistoryButtonProps> = ({ 
  document,
  onRestore
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  
  const handleRestoreVersion = (version: DocumentVersion) => {
    if (onRestore && version.snapshot) {
      onRestore(document, version);
    }
    setShowHistory(false);
  };
  
  return (
    <>
      <button
        onClick={() => setShowHistory(true)}
        className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 dark:border-gray-600 shadow-sm text-xs font-medium rounded text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
        title="Voir l'historique des versions"
      >
        <FiClock className="mr-1.5 h-3.5 w-3.5" />
        Versions
      </button>
      
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-lg font-medium">Historique des versions</h2>
              <button
                onClick={() => {
                  setShowHistory(false);
                  setSelectedVersion(null);
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Document : {document.filename}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  ID : {document.id}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Traité le : {new Date(document.processedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              
              {selectedVersion ? (
                <VersionDiffViewer
                  documentId={document.id}
                  fromVersion={selectedVersion.versionNumber - 1 > 0 ? selectedVersion.versionNumber - 1 : 1}
                  toVersion={selectedVersion.versionNumber}
                  onClose={() => setSelectedVersion(null)}
                />
              ) : (
                <DocumentVersionHistory
                  document={document}
                  onRestoreVersion={handleRestoreVersion}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default VersionHistoryButton;
