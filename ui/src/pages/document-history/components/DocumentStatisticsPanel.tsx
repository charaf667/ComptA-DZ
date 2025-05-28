import React from 'react';
import { FiFileText, FiEdit, FiTag, FiClock } from 'react-icons/fi';
import type { DocumentStatistics } from '../../../types/document-history';

interface DocumentStatisticsPanelProps {
  statistics: DocumentStatistics | null;
  isLoading: boolean;
}

const DocumentStatisticsPanel: React.FC<DocumentStatisticsPanelProps> = ({
  statistics,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-300 dark:bg-gray-700 h-10 w-10"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!statistics) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-500 dark:text-gray-400">
          Aucune statistique disponible
        </p>
      </div>
    );
  }

  const statItems = [
    {
      icon: <FiFileText className="h-6 w-6 text-blue-500" />,
      label: 'Total des documents',
      value: statistics.totalDocuments,
      color: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      icon: <FiEdit className="h-6 w-6 text-yellow-500" />,
      label: 'Documents édités',
      value: statistics.editedDocuments,
      color: 'bg-yellow-100 dark:bg-yellow-900/30'
    },
    {
      icon: <FiTag className="h-6 w-6 text-green-500" />,
      label: 'Documents avec tags',
      value: statistics.taggedDocuments,
      color: 'bg-green-100 dark:bg-green-900/30'
    },
    {
      icon: <FiClock className="h-6 w-6 text-purple-500" />,
      label: 'Derniers 30 jours',
      value: statistics.last30DaysDocuments,
      color: 'bg-purple-100 dark:bg-purple-900/30'
    }
  ];

  return (
    <div className="space-y-4">
      {statItems.map((item, index) => (
        <div 
          key={index}
          className={`p-4 rounded-lg ${item.color} flex items-center`}
        >
          <div className="mr-4 bg-white dark:bg-gray-800 rounded-full p-2">
            {item.icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {item.label}
            </p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {item.value}
            </p>
          </div>
        </div>
      ))}

      {/* Top tags section */}
      {statistics.topTags && statistics.topTags.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Tags les plus utilisés
          </h3>
          <div className="space-y-2">
            {statistics.topTags.map((tag: { name: string; count: number }, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[70%]">
                  {tag.name}
                </span>
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-2">
                    {tag.count}
                  </span>
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(tag.count / Math.max(...statistics.topTags.map((t: { count: number }) => t.count))) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top accounts section */}
      {statistics.topAccounts && statistics.topAccounts.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
            Comptes les plus utilisés
          </h3>
          <div className="space-y-2">
            {statistics.topAccounts.map((account, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="truncate max-w-[70%]">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {account.compteCode}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    {account.libelleCompte}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mr-2">
                    {account.count}
                  </span>
                  <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full" 
                      style={{ 
                        width: `${(account.count / Math.max(...statistics.topAccounts.map(a => a.count))) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentStatisticsPanel;
