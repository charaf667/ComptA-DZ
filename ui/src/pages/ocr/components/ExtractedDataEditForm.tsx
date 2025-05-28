import React, { useState, useEffect } from 'react';
import type { ExtractedData } from '../../../types/ocr';

interface ValidationErrors {
  [key: string]: string;
}

interface ExtractedDataEditFormProps {
  initialData: ExtractedData;
  onSave: (data: ExtractedData) => void;
  onCancel: () => void;
}

const ExtractedDataEditForm: React.FC<ExtractedDataEditFormProps> = ({ initialData, onSave, onCancel }) => {
  const [formData, setFormData] = useState<ExtractedData>(initialData);
  const [errors, setErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Effacer l'erreur pour ce champ lorsqu'il est modifié
    if (errors[name]) {
      setErrors(prevErrors => {
        const newErrors = { ...prevErrors };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Handle nested fournisseurDetails
    if (name.startsWith('fournisseurDetails.')) {
      const detailKey = name.split('.')[1] as keyof ExtractedData['fournisseurDetails'];
      setFormData(prevData => ({
        ...prevData,
        fournisseurDetails: {
          ...prevData.fournisseurDetails,
          [detailKey]: value,
        },
      }));
    } else {
      // Convertir les valeurs numériques si nécessaire
      let processedValue: any = value;
      if (['montantHT', 'tva', 'montantTTC'].includes(name) && value !== '') {
        processedValue = parseFloat(value);
        if (isNaN(processedValue)) {
          processedValue = value; // Garder la valeur d'origine si la conversion échoue
        }
      }
      
      setFormData(prevData => ({
        ...prevData,
        [name]: processedValue,
      }));
    }
  };
  
  // Fonction de validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Validation des montants
    if (formData.montantHT && isNaN(Number(formData.montantHT))) {
      newErrors['montantHT'] = 'Le montant HT doit être un nombre valide';
    }
    
    if (formData.tva && isNaN(Number(formData.tva))) {
      newErrors['tva'] = 'La TVA doit être un nombre valide';
    }
    
    if (formData.montantTTC && isNaN(Number(formData.montantTTC))) {
      newErrors['montantTTC'] = 'Le montant TTC doit être un nombre valide';
    }
    
    // Validation des dates
    if (formData.dateFacture) {
      const dateFacture = new Date(formData.dateFacture);
      if (isNaN(dateFacture.getTime())) {
        newErrors['dateFacture'] = 'La date de facture est invalide';
      }
    }
    
    // Définir les erreurs et retourner true si aucune erreur
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Valider le formulaire avant de soumettre
    if (validateForm()) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Modifier les Données Extraites</h2>
      
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
        <div className="sm:col-span-3">
          <label htmlFor="dateFacture" className="block text-sm font-medium text-gray-700">
            Date de Facture
          </label>
          <input
            type="date" // Consider using a date picker component later
            name="dateFacture"
            id="dateFacture"
            value={formData.dateFacture || ''}
            onChange={handleChange}
            className={`mt-1 block w-full shadow-sm sm:text-sm ${errors.dateFacture ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md`}
          />
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="numeroFacture" className="block text-sm font-medium text-gray-700">
            Numéro de Facture
          </label>
          <input
            type="text"
            name="numeroFacture"
            id="numeroFacture"
            value={formData.numeroFacture || ''}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="libelle" className="block text-sm font-medium text-gray-700">
            Libellé
          </label>
          <input
            type="text"
            name="libelle"
            id="libelle"
            value={formData.libelle || ''}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="montantHT" className="block text-sm font-medium text-gray-700">
            Montant HT
          </label>
          <input
            type="number"
            name="montantHT"
            id="montantHT"
            value={formData.montantHT || ''}
            onChange={handleChange}
            step="0.01"
            className={`mt-1 block w-full shadow-sm sm:text-sm ${errors.montantHT ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md`}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="tva" className="block text-sm font-medium text-gray-700">
            TVA
          </label>
          <input
            type="number"
            name="tva"
            id="tva"
            value={formData.tva || ''}
            onChange={handleChange}
            step="0.01"
            className={`mt-1 block w-full shadow-sm sm:text-sm ${errors.tva ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md`}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="montantTTC" className="block text-sm font-medium text-gray-700">
            Montant TTC
          </label>
          <input
            type="number"
            name="montantTTC"
            id="montantTTC"
            value={formData.montantTTC || ''}
            onChange={handleChange}
            step="0.01"
            className={`mt-1 block w-full shadow-sm sm:text-sm ${errors.montantTTC ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-md`}
          />
        </div>

        <div className="sm:col-span-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Détails Fournisseur</h3>
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="fournisseurDetails.nom" className="block text-sm font-medium text-gray-700">
            Nom du Fournisseur
          </label>
          <input
            type="text"
            name="fournisseurDetails.nom"
            id="fournisseurDetails.nom"
            value={formData.fournisseurDetails?.nom || ''}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>

        <div className="sm:col-span-3">
          <label htmlFor="fournisseurDetails.siren" className="block text-sm font-medium text-gray-700">
            SIREN
          </label>
          <input
            type="text"
            name="fournisseurDetails.siren"
            id="fournisseurDetails.siren"
            value={formData.fournisseurDetails?.siren || ''}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>

        <div className="sm:col-span-6">
          <label htmlFor="fournisseurDetails.adresse" className="block text-sm font-medium text-gray-700">
            Adresse Fournisseur
          </label>
          <textarea
            name="fournisseurDetails.adresse"
            id="fournisseurDetails.adresse"
            value={formData.fournisseurDetails?.adresse || ''}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
          />
        </div>

         <div className="sm:col-span-3">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type de Document
          </label>
          <select
            id="type"
            name="type"
            value={formData.type || ''}
            onChange={handleChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="">Sélectionner un type</option>
            <option value="facture">Facture</option>
            <option value="avoir">Avoir</option>
            <option value="devis">Devis</option>
            <option value="bon_livraison">Bon de Livraison</option>
            <option value="autre">Autre</option>
          </select>
        </div>

      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <button 
          type="button" 
          onClick={onCancel} 
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Annuler
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Sauvegarder
        </button>
      </div>
    </form>
  );
};

export default ExtractedDataEditForm;
