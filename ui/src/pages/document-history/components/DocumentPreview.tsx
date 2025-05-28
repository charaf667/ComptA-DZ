import React, { useState } from 'react';
import { FiMaximize2, FiMinimize2, FiDownload, FiX } from 'react-icons/fi';

interface DocumentPreviewProps {
  filename: string;
  documentId: string;
  onClose: () => void;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({ filename, documentId, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Déterminer le type de document (PDF ou image)
  const fileExtension = filename.split('.').pop()?.toLowerCase();
  const isPdf = fileExtension === 'pdf';
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension || '');
  
  // URL de prévisualisation (à remplacer par l'URL réelle du document)
  // Dans une implémentation réelle, cette URL proviendrait d'une API
  const previewUrl = `/api/document-history/${documentId}/preview`;
  
  // Simuler le chargement
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  
  // Télécharger le document
  const handleDownload = () => {
    // Dans une implémentation réelle, cela déclencherait un téléchargement
    window.open(`/api/document-history/${documentId}/download`, '_blank');
  };
  
  // Basculer en mode plein écran
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isFullscreen ? 'p-0' : 'p-4'}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl flex flex-col ${isFullscreen ? 'w-full h-full' : 'w-3/4 h-3/4'}`}>
        {/* En-tête */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 truncate">
            {filename}
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Télécharger"
            >
              <FiDownload className="h-5 w-5" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title={isFullscreen ? "Quitter le plein écran" : "Plein écran"}
            >
              {isFullscreen ? (
                <FiMinimize2 className="h-5 w-5" />
              ) : (
                <FiMaximize2 className="h-5 w-5" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              title="Fermer"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Contenu */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement du document...</p>
            </div>
          ) : (
            <>
              {isPdf && (
                <iframe
                  src={`${previewUrl}#toolbar=0`}
                  className="w-full h-full border-0"
                  title={filename}
                />
              )}
              {isImage && (
                <img
                  src={previewUrl}
                  alt={filename}
                  className="max-w-full max-h-full object-contain"
                />
              )}
              {!isPdf && !isImage && (
                <div className="text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    La prévisualisation n'est pas disponible pour ce type de fichier.
                  </p>
                  <button
                    onClick={handleDownload}
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <FiDownload className="mr-2 h-4 w-4" />
                    Télécharger le fichier
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreview;
