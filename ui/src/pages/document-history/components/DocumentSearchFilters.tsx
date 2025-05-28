import React, { useState, useEffect } from 'react';
import { FiSearch, FiCalendar, FiDollarSign, FiUser, FiTag, FiRefreshCw } from 'react-icons/fi';
import type { DocumentFilterOptions } from '../../../types/document-history';

interface DocumentSearchFiltersProps {
  onApplyFilters: (filters: DocumentFilterOptions) => void;
  onResetFilters: () => void;
  initialFilters?: DocumentFilterOptions;
}

const DocumentSearchFilters: React.FC<DocumentSearchFiltersProps> = ({
  onApplyFilters,
  onResetFilters,
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState<DocumentFilterOptions>({
    startDate: initialFilters.startDate || '',
    endDate: initialFilters.endDate || '',
    fournisseur: initialFilters.fournisseur || '',
    montantMin: initialFilters.montantMin,
    montantMax: initialFilters.montantMax,
    compteCode: initialFilters.compteCode || '',
    isEdited: initialFilters.isEdited,
    searchText: initialFilters.searchText || '',
    limit: initialFilters.limit || 10
  });

  // Mettre à jour les filtres si les initialFilters changent
  useEffect(() => {
    setFilters({
      startDate: initialFilters.startDate || '',
      endDate: initialFilters.endDate || '',
      fournisseur: initialFilters.fournisseur || '',
      montantMin: initialFilters.montantMin,
      montantMax: initialFilters.montantMax,
      compteCode: initialFilters.compteCode || '',
      isEdited: initialFilters.isEdited,
      searchText: initialFilters.searchText || '',
      limit: initialFilters.limit || 10
    });
  }, [initialFilters]);

  // Gestionnaire de changement pour les champs de formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    // Conversion des valeurs numériques
    if (type === 'number') {
      setFilters({
        ...filters,
        [name]: value ? parseFloat(value) : undefined
      });
    } else if (name === 'isEdited' && type === 'checkbox') {
      const isChecked = (e.target as HTMLInputElement).checked;
      setFilters({
        ...filters,
        isEdited: isChecked ? true : undefined
      });
    } else {
      setFilters({
        ...filters,
        [name]: value
      });
    }
  };

  // Gestionnaire pour appliquer les filtres
  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    onApplyFilters(filters);
  };

  // Gestionnaire pour réinitialiser les filtres
  const handleResetFilters = () => {
    setFilters({
      startDate: '',
      endDate: '',
      fournisseur: '',
      montantMin: undefined,
      montantMax: undefined,
      compteCode: '',
      isEdited: undefined,
      searchText: '',
      limit: 10
    });
    onResetFilters();
  };

  return (
    <form onSubmit={handleApplyFilters} className="space-y-4">
      {/* Recherche textuelle */}
      <div>
        <label htmlFor="searchText" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Recherche
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            id="searchText"
            name="searchText"
            value={filters.searchText}
            onChange={handleChange}
            placeholder="Rechercher..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          Recherche dans le libellé, fournisseur, référence, etc.
        </p>
      </div>

      {/* Période */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          <div className="flex items-center mb-1">
            <FiCalendar className="mr-1" />
            Période
          </div>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="startDate" className="sr-only">Date de début</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={filters.startDate}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="sr-only">Date de fin</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={filters.endDate}
              onChange={handleChange}
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Fournisseur */}
      <div>
        <label htmlFor="fournisseur" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <div className="flex items-center">
            <FiUser className="mr-1" />
            Fournisseur
          </div>
        </label>
        <input
          type="text"
          id="fournisseur"
          name="fournisseur"
          value={filters.fournisseur}
          onChange={handleChange}
          placeholder="Nom du fournisseur"
          className="block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Montant */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          <div className="flex items-center mb-1">
            <FiDollarSign className="mr-1" />
            Montant
          </div>
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label htmlFor="montantMin" className="sr-only">Montant minimum</label>
            <input
              type="number"
              id="montantMin"
              name="montantMin"
              value={filters.montantMin || ''}
              onChange={handleChange}
              placeholder="Min"
              min="0"
              step="0.01"
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="montantMax" className="sr-only">Montant maximum</label>
            <input
              type="number"
              id="montantMax"
              name="montantMax"
              value={filters.montantMax || ''}
              onChange={handleChange}
              placeholder="Max"
              min="0"
              step="0.01"
              className="block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Code compte */}
      <div>
        <label htmlFor="compteCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          <div className="flex items-center">
            <FiTag className="mr-1" />
            Code Compte
          </div>
        </label>
        <input
          type="text"
          id="compteCode"
          name="compteCode"
          value={filters.compteCode}
          onChange={handleChange}
          placeholder="Ex: 6064"
          className="block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      {/* Documents édités */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isEdited"
          name="isEdited"
          checked={filters.isEdited === true}
          onChange={handleChange}
          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
        />
        <label htmlFor="isEdited" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
          Documents édités uniquement
        </label>
      </div>

      {/* Nombre de résultats par page */}
      <div>
        <label htmlFor="limit" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Résultats par page
        </label>
        <select
          id="limit"
          name="limit"
          value={filters.limit}
          onChange={handleChange}
          className="block w-full border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* Boutons d'action */}
      <div className="flex space-x-2 pt-2">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-800"
        >
          Appliquer
        </button>
        <button
          type="button"
          onClick={handleResetFilters}
          className="flex items-center justify-center bg-gray-100 text-gray-700 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          <FiRefreshCw className="mr-1" />
          Réinitialiser
        </button>
      </div>
    </form>
  );
};

export default DocumentSearchFilters;
