import React, { useState, useEffect } from 'react';
import { FiFile, FiTrash2, FiEdit, FiPlus, FiChevronLeft, FiChevronRight, FiEye, FiArrowUp, FiArrowDown } from 'react-icons/fi';
import type { ProcessedDocument } from '../../../types/document-history';
import { Link } from 'react-router-dom';
import DocumentPreview from './DocumentPreview';
import ColoredTag from '../../../components/ColoredTag';
import { motion, AnimatePresence } from 'framer-motion';
import AccountingEntryButton from './AccountingEntryButton';

interface DocumentListProps {
  documents: ProcessedDocument[];
  isLoading: boolean;
  onDeleteDocument: (documentId: string) => void;
  onAddTag: (documentId: string, tag: string) => void;
  onRemoveTag: (documentId: string, tag: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onRefresh?: () => void;
}

type SortField = 'date' | 'filename' | 'fournisseur' | 'montant' | 'compte';
type SortDirection = 'asc' | 'desc';

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  isLoading,
  onDeleteDocument,
  onAddTag,
  onRemoveTag,
  currentPage,
  totalPages,
  onPageChange,
  onRefresh
}) => {
  const [newTags, setNewTags] = useState<Record<string, string>>({});
  const [expandedDocument, setExpandedDocument] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [sortedDocuments, setSortedDocuments] = useState<ProcessedDocument[]>([]);
  const [previewDocument, setPreviewDocument] = useState<ProcessedDocument | null>(null);
  
  // Appliquer le tri aux documents
  useEffect(() => {
    if (isLoading || !documents.length) {
      setSortedDocuments([]);
      return;
    }
    
    const sorted = [...documents].sort((a, b) => {
      let valueA: any;
      let valueB: any;
      
      switch (sortField) {
        case 'date':
          valueA = new Date(a.processedAt).getTime();
          valueB = new Date(b.processedAt).getTime();
          break;
        case 'filename':
          valueA = a.filename.toLowerCase();
          valueB = b.filename.toLowerCase();
          break;
        case 'fournisseur':
          valueA = a.extractedData.fournisseur?.toLowerCase() || '';
          valueB = b.extractedData.fournisseur?.toLowerCase() || '';
          break;
        case 'montant':
          valueA = a.extractedData.montant || 0;
          valueB = b.extractedData.montant || 0;
          break;
        case 'compte':
          valueA = a.selectedAccount?.compteCode || '';
          valueB = b.selectedAccount?.compteCode || '';
          break;
        default:
          valueA = new Date(a.processedAt).getTime();
          valueB = new Date(b.processedAt).getTime();
      }
      
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (valueA < valueB) return -1 * direction;
      if (valueA > valueB) return 1 * direction;
      return 0;
    });
    
    setSortedDocuments(sorted);
  }, [documents, sortField, sortDirection, isLoading]);
  
  // Gestionnaire pour changer le tri
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Inverser la direction si on clique sur le même champ
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Nouveau champ, définir la direction par défaut
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Fonction pour afficher l'indicateur de tri
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === 'asc' ? 
      <FiArrowUp className="ml-1 h-4 w-4" /> : 
      <FiArrowDown className="ml-1 h-4 w-4" />;
  };
  
  // Ouvrir la prévisualisation du document
  const openPreview = (document: ProcessedDocument) => {
    setPreviewDocument(document);
  };
  
  // Fermer la prévisualisation du document
  const closePreview = () => {
    setPreviewDocument(null);
  };

  // Gestionnaire pour l'ajout d'un tag
  const handleAddTag = (documentId: string) => {
    const tag = newTags[documentId]?.trim();
    if (tag) {
      onAddTag(documentId, tag);
      // Réinitialiser le champ de saisie
      setNewTags({
        ...newTags,
        [documentId]: ''
      });
    }
  };

  // Gestionnaire pour le changement de la valeur du tag
  const handleTagChange = (documentId: string, value: string) => {
    setNewTags({
      ...newTags,
      [documentId]: value
    });
  };

  // Gestionnaire pour la suppression d'un tag
  const handleRemoveTag = (documentId: string, tag: string) => {
    onRemoveTag(documentId, tag);
  };

  // Gestionnaire pour basculer l'expansion d'un document
  const toggleExpand = (documentId: string) => {
    if (expandedDocument === documentId) {
      setExpandedDocument(null);
    } else {
      setExpandedDocument(documentId);
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Formater le montant
  const formatAmount = (amount?: number) => {
    if (amount === undefined) return 'N/A';
    return `${amount.toFixed(2)} DZD`;
  };

  // Générer les pages pour la pagination
  const generatePaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    
    // Toujours afficher la première page
    items.push(
      <button
        key="first"
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded ${
          currentPage === 1
            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
        }`}
      >
        1
      </button>
    );
    
    // Calculer les pages à afficher
    let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
    
    // Ajuster si on est proche du début ou de la fin
    if (endPage <= startPage) {
      endPage = startPage;
    }
    
    // Ajouter des ellipses si nécessaire
    if (startPage > 2) {
      items.push(
        <span key="ellipsis1" className="px-3 py-1">
          ...
        </span>
      );
    }
    
    // Ajouter les pages intermédiaires
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 rounded ${
            currentPage === i
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Ajouter des ellipses si nécessaire
    if (endPage < totalPages - 1) {
      items.push(
        <span key="ellipsis2" className="px-3 py-1">
          ...
        </span>
      );
    }
    
    // Toujours afficher la dernière page si elle existe
    if (totalPages > 1) {
      items.push(
        <button
          key="last"
          onClick={() => onPageChange(totalPages)}
          className={`px-3 py-1 rounded ${
            currentPage === totalPages
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
              : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          {totalPages}
        </button>
      );
    }
    
    return items;
  };
  
  // Gestionnaire pour le rafraîchissement après une action sur une écriture comptable
  const handleAccountingSuccess = () => {
    if (onRefresh) {
      onRefresh();
    }
  };
  
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                <button 
                  onClick={() => handleSort('filename')} 
                  className="flex items-center focus:outline-none hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Document
                  {renderSortIndicator('filename')}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                <button 
                  onClick={() => handleSort('date')} 
                  className="flex items-center focus:outline-none hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Date
                  {renderSortIndicator('date')}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                <button 
                  onClick={() => handleSort('fournisseur')} 
                  className="flex items-center focus:outline-none hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Fournisseur
                  {renderSortIndicator('fournisseur')}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                <button 
                  onClick={() => handleSort('montant')} 
                  className="flex items-center focus:outline-none hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Montant
                  {renderSortIndicator('montant')}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                <button 
                  onClick={() => handleSort('compte')} 
                  className="flex items-center focus:outline-none hover:text-gray-700 dark:hover:text-gray-300"
                >
                  Compte
                  {renderSortIndicator('compte')}
                </button>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            <AnimatePresence>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center"
                    >
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">Chargement des documents...</p>
                    </motion.div>
                  </td>
                </tr>
              ) : sortedDocuments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center"
                    >
                      <p className="text-gray-600 dark:text-gray-400">Aucun document trouvé</p>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                sortedDocuments.map((document, index) => (
                  <React.Fragment key={document.id}>
                    <motion.tr
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 ${expandedDocument === document.id ? 'bg-gray-50 dark:bg-gray-800/50' : ''}`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleExpand(document.id)}
                            className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 mr-2"
                          >
                            <FiFile className="h-5 w-5" />
                          </button>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {document.filename}
                            </div>
                            {document.isEdited && (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                                Édité
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {formatDate(document.processedAt)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {document.extractedData.fournisseur || 'Non spécifié'}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {formatAmount(document.extractedData.montant)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-gray-100">
                          {document.selectedAccount ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              {document.selectedAccount.compteCode}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                              Non assigné
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => openPreview(document)}
                            className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-500 dark:hover:text-blue-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/20"
                            title="Prévisualiser"
                          >
                            <FiEye className="h-4 w-4" />
                          </button>
                          <AccountingEntryButton 
                            document={document} 
                            onSuccess={handleAccountingSuccess} 
                          />
                          <button
                            onClick={() => onDeleteDocument(document.id)}
                            className="p-2 text-red-600 hover:text-red-800 dark:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20"
                            title="Supprimer"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                          <Link
                            to={`/ocr?edit=${document.id}`}
                            className="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-500 dark:hover:text-indigo-400 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/20"
                            title="Éditer"
                          >
                            <FiEdit className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                    {expandedDocument === document.id && (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50">
                          <div className="p-4">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Détails du document
                            </h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Date de traitement</p>
                                <p className="text-sm text-gray-800 dark:text-gray-200">
                                  {formatDate(document.processedAt)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Dernière modification</p>
                                <p className="text-sm text-gray-800 dark:text-gray-200">
                                  {document.lastEditedAt ? formatDate(document.lastEditedAt) : 'Jamais modifié'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Fournisseur</p>
                                <p className="text-sm text-gray-800 dark:text-gray-200">
                                  {document.extractedData.fournisseur || 'Non spécifié'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Montant</p>
                                <p className="text-sm text-gray-800 dark:text-gray-200">
                                  {formatAmount(document.extractedData.montant)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Compte</p>
                                <p className="text-sm text-gray-800 dark:text-gray-200">
                                  {document.selectedAccount
                                    ? `${document.selectedAccount.compteCode} - ${document.selectedAccount.libelleCompte}`
                                    : 'Non assigné'}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Référence</p>
                                <p className="text-sm text-gray-800 dark:text-gray-200">
                                  {document.extractedData.reference || 'Non spécifiée'}
                                </p>
                              </div>
                            </div>
                            
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                              Tags
                            </h4>
                            <div className="flex flex-wrap gap-2 mb-4">
                              <div className="mt-2 flex flex-wrap gap-1">
                                {document.tags?.map((tag, index) => (
                                  <ColoredTag
                                    key={tag}
                                    tag={tag}
                                    onRemove={() => handleRemoveTag(document.id, tag)}
                                    colorIndex={index}
                                  />
                                ))}
                              </div>
                              {(!document.tags || document.tags.length === 0) && (
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  Aucun tag
                                </span>
                              )}
                            </div>
                            <div className="flex mt-2">
                              <input
                                type="text"
                                value={newTags[document.id] || ''}
                                onChange={(e) => handleTagChange(document.id, e.target.value)}
                                placeholder="Ajouter un tag..."
                                className="flex-1 border-r-0 rounded-l-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm border-gray-300 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddTag(document.id);
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleAddTag(document.id)}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-800"
                              >
                                <FiPlus className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Prévisualisation du document */}
      {previewDocument && (
        <DocumentPreview
          filename={previewDocument.filename}
          documentId={previewDocument.id}
          onClose={closePreview}
        />
      )}
      
      {totalPages > 1 && (
        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Précédent
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Affichage de <span className="font-medium">{documents.length}</span> documents
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <span className="sr-only">Précédent</span>
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                {generatePaginationItems()}
                <button
                  onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700"
                >
                  <span className="sr-only">Suivant</span>
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;
