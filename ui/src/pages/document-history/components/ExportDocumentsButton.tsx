import React, { useState } from 'react';
import { FiDownload, FiFile, FiFileText } from 'react-icons/fi';
import type { ProcessedDocument } from '../../../types/document-history';
import exportService from '../../../services/export.service';

interface ExportDocumentsButtonProps {
  documents: ProcessedDocument[];
  selectedDocuments?: string[];
}

const ExportDocumentsButton: React.FC<ExportDocumentsButtonProps> = ({ 
  documents, 
  selectedDocuments 
}) => {
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  // Obtenir uniquement les documents sélectionnés, s'il y en a
  const getFilteredDocuments = (): ProcessedDocument[] => {
    if (!selectedDocuments || selectedDocuments.length === 0) {
      return documents;
    }
    return documents.filter(doc => selectedDocuments.includes(doc.id));
  };
  
  // Exporter au format PDF
  const handleExportPdf = () => {
    const docsToExport = getFilteredDocuments();
    const title = selectedDocuments && selectedDocuments.length > 0
      ? `Documents sélectionnés (${docsToExport.length})`
      : 'Tous les documents';
    
    exportService.exportDocumentsToPdf(docsToExport, title);
    setShowExportOptions(false);
  };
  
  // Exporter au format Excel
  const handleExportExcel = () => {
    const docsToExport = getFilteredDocuments();
    const title = selectedDocuments && selectedDocuments.length > 0
      ? `Documents sélectionnés (${docsToExport.length})`
      : 'Tous les documents';
    
    exportService.exportDocumentsToExcel(docsToExport, title);
    setShowExportOptions(false);
  };
  
  // Générer un rapport financier
  const handleGenerateReport = (type: 'mensuel' | 'trimestriel' | 'annuel') => {
    const docsToExport = getFilteredDocuments();
    
    // Dans une implémentation réelle, on récupérerait les données comptables
    // depuis un service approprié. Pour l'instant, on utilise un objet vide.
    const accountingData = {};
    
    exportService.generateFinancialReport(docsToExport, accountingData, type);
    setShowExportOptions(false);
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setShowExportOptions(!showExportOptions)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-800"
      >
        <FiDownload className="mr-2 -ml-1 h-4 w-4" />
        Exporter
      </button>
      
      {showExportOptions && (
        <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1">
            <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
              <div className="font-medium">Exporter les documents</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {selectedDocuments && selectedDocuments.length > 0
                  ? `${selectedDocuments.length} document(s) sélectionné(s)`
                  : `${documents.length} document(s) au total`}
              </div>
            </div>
            
            <button
              onClick={handleExportPdf}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <FiFile className="mr-2 h-4 w-4 text-red-600 dark:text-red-400" />
              Exporter en PDF
            </button>
            
            <button
              onClick={handleExportExcel}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
            >
              <FiFile className="mr-2 h-4 w-4 text-green-600 dark:text-green-400" />
              Exporter en Excel
            </button>
            
            <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
              <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                <div className="font-medium">Rapports financiers</div>
              </div>
              
              <button
                onClick={() => handleGenerateReport('mensuel')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <FiFileText className="mr-2 h-4 w-4 text-blue-600 dark:text-blue-400" />
                Rapport mensuel
              </button>
              
              <button
                onClick={() => handleGenerateReport('trimestriel')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <FiFileText className="mr-2 h-4 w-4 text-purple-600 dark:text-purple-400" />
                Rapport trimestriel
              </button>
              
              <button
                onClick={() => handleGenerateReport('annuel')}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
              >
                <FiFileText className="mr-2 h-4 w-4 text-orange-600 dark:text-orange-400" />
                Rapport annuel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportDocumentsButton;
