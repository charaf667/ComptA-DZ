import React from 'react';
import { FiCalendar, FiDollarSign, FiTag, FiUser, FiHash } from 'react-icons/fi';

interface ExtractedData {
  date?: string;
  montant?: number;
  tva?: number;
  libelle?: string;
  fournisseur?: string;
  reference?: string;
  confidence: number;
}

interface ExtractedDataDisplayProps {
  data: ExtractedData;
  isLoading?: boolean;
}

const ExtractedDataDisplay: React.FC<ExtractedDataDisplayProps> = ({ data, isLoading = false }) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return 'text-success';
    if (confidence >= 0.4) return 'text-warning';
    return 'text-error';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.7) return 'Élevée';
    if (confidence >= 0.4) return 'Moyenne';
    return 'Faible';
  };

  if (isLoading) {
    return (
      <div className="p-6 border rounded-lg bg-background dark:bg-background-dark shadow-sm animate-pulse">
        <h3 className="text-lg font-medium mb-4">Données extraites</h3>
        <div className="space-y-3">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full mr-3"></div>
              <div className="flex-1">
                <div className="h-4 bg-secondary dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-secondary dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-lg bg-background dark:bg-background-dark shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Données extraites</h3>
        <div className="flex items-center">
          <span className="text-sm text-text-secondary mr-2">Confiance:</span>
          <span className={`text-sm font-medium ${getConfidenceColor(data.confidence)}`}>
            {getConfidenceLabel(data.confidence)} ({Math.round(data.confidence * 100)}%)
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-start">
          <FiCalendar className="mt-1 mr-3 text-text-secondary" />
          <div>
            <p className="text-sm text-text-secondary">Date</p>
            <p className="font-medium">{data.date || 'Non détectée'}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <FiDollarSign className="mt-1 mr-3 text-gray-400" />
          <div>
            <p className="text-sm text-text-secondary">Montant</p>
            <p className="font-medium">
              {data.montant ? `${data.montant.toFixed(2)} DZD` : 'Non détecté'}
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <FiDollarSign className="mt-1 mr-3 text-gray-400" />
          <div>
            <p className="text-sm text-text-secondary">TVA</p>
            <p className="font-medium">
              {data.tva ? `${data.tva.toFixed(2)} DZD` : 'Non détectée'}
            </p>
          </div>
        </div>
        
        <div className="flex items-start">
          <FiTag className="mt-1 mr-3 text-text-secondary" />
          <div>
            <p className="text-sm text-text-secondary">Libellé</p>
            <p className="font-medium">{data.libelle || 'Non détecté'}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <FiUser className="mt-1 mr-3 text-text-secondary" />
          <div>
            <p className="text-sm text-text-secondary">Fournisseur</p>
            <p className="font-medium">{data.fournisseur || 'Non détecté'}</p>
          </div>
        </div>
        
        <div className="flex items-start">
          <FiHash className="mt-1 mr-3 text-text-secondary" />
          <div>
            <p className="text-sm text-text-secondary">Référence</p>
            <p className="font-medium">{data.reference || 'Non détectée'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtractedDataDisplay;
