import React, { useState, useEffect } from 'react';
import { FiFileText, FiFilter, FiAlertTriangle, FiInfo, FiRefreshCw } from 'react-icons/fi';
import documentHistoryService from '../../services/document-history.service';
import type { ProcessedDocument, DocumentFilterOptions, DocumentStatistics } from '../../types/document-history';
import { DocumentSearchFilters, DocumentList, DocumentStatisticsPanel, ExportDocumentsButton } from './components';

const DocumentHistoryPage: React.FC = () => {
  // États pour les documents et les filtres
  const [documents, setDocuments] = useState<ProcessedDocument[]>([]);
  const [filterOptions, setFilterOptions] = useState<DocumentFilterOptions>({
    limit: 10,
    offset: 0
  });
  const [statistics, setStatistics] = useState<DocumentStatistics | null>(null);
  const [totalDocuments, setTotalDocuments] = useState<number>(0);
  
  // États pour la gestion du chargement et des erreurs
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isStatsLoading, setIsStatsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  // Chargement initial des documents et des statistiques
  useEffect(() => {
    loadDocuments();
    loadStatistics();
  }, []);

  // Chargement des documents lorsque les filtres ou la pagination changent
  useEffect(() => {
    loadDocuments();
  }, [filterOptions, currentPage]);

  // Fonction pour charger les documents
  const loadDocuments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Calculer l'offset en fonction de la page courante
      const offset = (currentPage - 1) * (filterOptions.limit || 10);
      const updatedFilters = { ...filterOptions, offset };
      
      const result = await documentHistoryService.searchDocuments(updatedFilters);
      setDocuments(result);
      
      // Mise à jour du nombre total de documents pour la pagination
      // Note: Dans une implémentation réelle, l'API devrait retourner le nombre total
      setTotalDocuments(result.length > 0 ? result.length + offset : 0);
      setTotalPages(Math.ceil(totalDocuments / (filterOptions.limit || 10)));
    } catch (error: any) {
      console.error('Erreur lors du chargement des documents:', error);
      setError('Erreur lors du chargement des documents. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour charger les statistiques
  const loadStatistics = async () => {
    setIsStatsLoading(true);
    
    try {
      const stats = await documentHistoryService.getStatistics();
      setStatistics(stats);
    } catch (error: any) {
      console.error('Erreur lors du chargement des statistiques:', error);
      // Ne pas afficher d'erreur pour les statistiques, ce n'est pas critique
    } finally {
      setIsStatsLoading(false);
    }
  };

  // Gestionnaire pour appliquer les filtres
  const handleFilterApply = (newFilters: DocumentFilterOptions) => {
    setFilterOptions(newFilters);
    setCurrentPage(1); // Réinitialiser à la première page lors de l'application des filtres
  };

  // Gestionnaire pour réinitialiser les filtres
  const handleFilterReset = () => {
    setFilterOptions({
      limit: 10,
      offset: 0
    });
    setCurrentPage(1);
  };

  // Gestionnaire pour la pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Gestionnaire pour la suppression d'un document
  const handleDeleteDocument = async (documentId: string) => {
    try {
      const success = await documentHistoryService.deleteDocument(documentId);
      
      if (success) {
        setSuccess('Document supprimé avec succès');
        // Recharger les documents et les statistiques
        loadDocuments();
        loadStatistics();
      } else {
        setError('Erreur lors de la suppression du document');
      }
    } catch (error: any) {
      console.error('Erreur lors de la suppression du document:', error);
      setError('Erreur lors de la suppression du document. Veuillez réessayer.');
    }
  };

  // Gestionnaire pour l'ajout d'un tag
  const handleAddTag = async (documentId: string, tag: string) => {
    try {
      await documentHistoryService.addTag(documentId, tag);
      
      // Mettre à jour le document dans la liste locale
      setDocuments(docs => docs.map(doc => {
        if (doc.id === documentId) {
          const updatedTags = [...(doc.tags || [])];
          if (!updatedTags.includes(tag)) {
            updatedTags.push(tag);
          }
          return { ...doc, tags: updatedTags };
        }
        return doc;
      }));
      
      setSuccess('Tag ajouté avec succès');
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du tag:', error);
      setError('Erreur lors de l\'ajout du tag. Veuillez réessayer.');
    }
  };

  // Gestionnaire pour la suppression d'un tag
  const handleRemoveTag = async (documentId: string, tag: string) => {
    try {
      await documentHistoryService.removeTag(documentId, tag);
      
      // Mettre à jour le document dans la liste locale
      setDocuments(docs => docs.map(doc => {
        if (doc.id === documentId && doc.tags) {
          return { ...doc, tags: doc.tags.filter(t => t !== tag) };
        }
        return doc;
      }));
      
      setSuccess('Tag supprimé avec succès');
    } catch (error: any) {
      console.error('Erreur lors de la suppression du tag:', error);
      setError('Erreur lors de la suppression du tag. Veuillez réessayer.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Historique des Documents</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Consultez et gérez l'historique des documents traités par OCR
        </p>
      </div>

      {/* Messages d'erreur et de succès */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800 rounded">
          <div className="flex items-center">
            <FiAlertTriangle className="mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800 rounded">
          <div className="flex items-center">
            <FiInfo className="mr-2" />
            <span>{success}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panneau de filtres et statistiques */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiFilter className="mr-2" />
              Filtres
            </h2>
            <DocumentSearchFilters 
              onApplyFilters={handleFilterApply}
              onResetFilters={handleFilterReset}
              initialFilters={filterOptions}
            />
          </div>

          {/* Panneau de statistiques */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
            <DocumentStatisticsPanel 
              statistics={statistics}
              isLoading={isStatsLoading}
            />
          </div>
        </div>

        {/* Liste des documents */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold flex items-center">
                  <FiFileText className="mr-2" />
                  Documents ({isLoading ? '...' : totalDocuments})
                </h2>
                <div className="flex items-center gap-2">
                  <ExportDocumentsButton 
                    documents={documents}
                  />
                  <button
                    onClick={() => {
                      loadDocuments();
                      loadStatistics();
                    }}
                    className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/20"
                    title="Rafraîchir"
                    disabled={isLoading}
                  >
                    <FiRefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            </div>

            <DocumentList 
              documents={documents}
              isLoading={isLoading}
              onDeleteDocument={handleDeleteDocument}
              onAddTag={handleAddTag}
              onRemoveTag={handleRemoveTag}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onRefresh={() => {
                loadDocuments();
                loadStatistics();
              }}
            />

            {/* Message si aucun document */}
            {!isLoading && documents.length === 0 && (
              <div className="p-12 text-center">
                <FiFileText className="mx-auto text-5xl text-gray-400 dark:text-gray-600 mb-4" />
                <h3 className="text-xl font-medium mb-2">Aucun document trouvé</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Aucun document ne correspond à vos critères de recherche ou l'historique est vide.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentHistoryPage;
