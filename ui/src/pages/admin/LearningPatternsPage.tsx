import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiFilter, FiDownload, FiRefreshCw } from 'react-icons/fi';
import { API_BASE_URL } from '../../config';

interface LearningPattern {
  pattern: string;
  accountCode: string;
  occurrences: number;
  lastUsed: string;
  confidence: number;
}

const LearningPatternsPage: React.FC = () => {
  const [patterns, setPatterns] = useState<LearningPattern[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    accountCode: '',
    minConfidence: 0.5,
    minOccurrences: 2
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchPatterns = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/ocr/learning-patterns`, {
        params: {
          accountCode: filters.accountCode || undefined,
          minConfidence: filters.minConfidence,
          minOccurrences: filters.minOccurrences
        }
      });
      
      if (response.data.success) {
        setPatterns(response.data.data);
      } else {
        setError(response.data.message || 'Erreur lors de la récupération des patterns');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erreur lors de la récupération des patterns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatterns();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: name === 'accountCode' ? value : parseFloat(value)
    }));
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatterns();
  };

  const exportToCSV = () => {
    if (patterns.length === 0) return;
    
    const headers = ['Pattern', 'Code Compte', 'Occurrences', 'Dernière Utilisation', 'Confiance'];
    const csvContent = [
      headers.join(','),
      ...patterns.map(p => [
        `"${p.pattern.replace(/"/g, '""')}"`,
        p.accountCode,
        p.occurrences,
        p.lastUsed,
        p.confidence.toFixed(2)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `patterns-apprentissage-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Patterns d'Apprentissage Adaptatif</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline flex items-center"
          >
            <FiFilter className="mr-2" />
            Filtres
          </button>
          <button
            onClick={fetchPatterns}
            className="btn btn-outline flex items-center"
            disabled={loading}
          >
            <FiRefreshCw className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </button>
          <button
            onClick={exportToCSV}
            className="btn btn-primary flex items-center"
            disabled={patterns.length === 0}
          >
            <FiDownload className="mr-2" />
            Exporter CSV
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg mb-6">
          <form onSubmit={handleFilterSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="accountCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Code Compte
              </label>
              <input
                type="text"
                id="accountCode"
                name="accountCode"
                value={filters.accountCode}
                onChange={handleFilterChange}
                placeholder="Ex: 6064"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div>
              <label htmlFor="minConfidence" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Confiance Minimum
              </label>
              <input
                type="range"
                id="minConfidence"
                name="minConfidence"
                min="0"
                max="1"
                step="0.05"
                value={filters.minConfidence}
                onChange={handleFilterChange}
                className="w-full"
              />
              <div className="text-xs text-right">{(filters.minConfidence * 100).toFixed(0)}%</div>
            </div>
            <div>
              <label htmlFor="minOccurrences" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Occurrences Minimum
              </label>
              <input
                type="number"
                id="minOccurrences"
                name="minOccurrences"
                min="1"
                value={filters.minOccurrences}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
              />
            </div>
            <div className="md:col-span-3">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                Appliquer les filtres
              </button>
            </div>
          </form>
        </div>
      )}

      {error && (
        <div className="bg-error/10 text-error p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
        </div>
      ) : patterns.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          Aucun pattern d'apprentissage trouvé
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Pattern
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Code Compte
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Occurrences
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Dernière Utilisation
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Confiance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {patterns.map((pattern, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {pattern.pattern}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {pattern.accountCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {pattern.occurrences}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(pattern.lastUsed).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                        <div 
                          className="bg-primary-500 h-2.5 rounded-full" 
                          style={{ width: `${pattern.confidence * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2">{(pattern.confidence * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default LearningPatternsPage;
