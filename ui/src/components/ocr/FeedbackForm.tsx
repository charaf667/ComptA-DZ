import React, { useState } from 'react';
import { FiThumbsUp, FiThumbsDown, FiSend, FiEdit } from 'react-icons/fi';

import type { AccountSuggestion } from '../../types/accounting';
import type { FeedbackData as GlobalFeedbackData } from '../../types/ocr';
import ExplanationPanel from '../ai/ExplanationPanel';
import type { ExplanationMetrics } from '../../types/explanation';

interface FeedbackFormProps {
  documentId: string; // ID du document, requis pour GlobalFeedbackData
  initialAISuggestionForDoc: AccountSuggestion | null; // Suggestion IA originale pour ce document
  selectedSuggestion: AccountSuggestion | null; // Suggestion actuellement en focus dans le formulaire
  onSubmitFeedback: (feedback: GlobalFeedbackData, explanationFeedback?: ExplanationMetrics) => Promise<void>;
  onCancel: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({
  documentId,
  initialAISuggestionForDoc,
  selectedSuggestion,
  onSubmitFeedback,
  onCancel
}) => {
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [comments, setComments] = useState('');
  const [corrections, setCorrections] = useState<{ field: string; value: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCorrectionForm, setShowCorrectionForm] = useState(false);
  const [currentCorrection, setCurrentCorrection] = useState({ field: '', value: '' });
  const [explanationFeedback, setExplanationFeedback] = useState<ExplanationMetrics | null>(null);

  const handleSubmit = async () => {
    if (isCorrect === null) {
      // Afficher un message d'erreur ou empêcher la soumission
      return;
    }

    setIsSubmitting(true);
    try {
      const feedbackToSend: GlobalFeedbackData = {
        documentId: documentId,
        initialAISuggestion: initialAISuggestionForDoc,
        selectedSuggestion: selectedSuggestion, // La suggestion sur laquelle le feedback est donné
        userCorrection: comments ? comments : undefined, // comments de l'état du formulaire
        // decisionTimeMs est optionnel et non pertinent pour ce feedback post-décision
      };
      
      // Si nous avons un feedback sur l'explication, l'envoyer également
      await onSubmitFeedback(
        feedbackToSend, 
        explanationFeedback ? {
          ...explanationFeedback,
          suggestionAccepted: isCorrect // Mettre à jour avec le choix final de l'utilisateur
        } : undefined
      );
      
      // Réinitialiser le formulaire après soumission réussie
      setIsCorrect(null);
      setComments('');
      setCorrections([]);
      setExplanationFeedback(null);
    } catch (error) {
      console.error('Erreur lors de la soumission du feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCorrection = () => {
    if (currentCorrection.field && currentCorrection.value) {
      setCorrections([...corrections, { ...currentCorrection }]);
      setCurrentCorrection({ field: '', value: '' });
    }
  };
  
  // Gestion du feedback sur les explications IA
  const handleExplanationFeedback = (feedback: {
    explanationHelpful: boolean;
    explanationType: string;
    suggestionAccepted: boolean;
    comments?: string;
  }) => {
    // Conversion du format du feedback pour correspondre à notre type ExplanationMetrics
    setExplanationFeedback({
      isHelpful: feedback.explanationHelpful,
      explanationType: feedback.explanationType,
      suggestionAccepted: feedback.suggestionAccepted,
      comments: feedback.comments
    });
  };

  return (
    <div className="p-6 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
      <h3 className="text-lg font-medium mb-4">Votre avis sur cette classification</h3>
      
      <div className="mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
          Cette suggestion vous semble-t-elle correcte ? Votre feedback nous aidera à améliorer nos suggestions.
        </p>
        
        <div className="flex space-x-4">
          <button
            className={`flex items-center px-4 py-2 rounded-md ${
              isCorrect === true
                ? 'bg-success text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setIsCorrect(true)}
          >
            <FiThumbsUp className="mr-2" />
            Correcte
          </button>
          
          <button
            className={`flex items-center px-4 py-2 rounded-md ${
              isCorrect === false
                ? 'bg-error text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            onClick={() => setIsCorrect(false)}
          >
            <FiThumbsDown className="mr-2" />
            Incorrecte
          </button>
        </div>
      </div>
      
      {isCorrect === false && (
        <div className="mb-6">
          <button
            className="flex items-center text-sm text-primary-500 hover:text-primary-600 mb-4"
            onClick={() => setShowCorrectionForm(!showCorrectionForm)}
          >
            <FiEdit className="mr-1" />
            {showCorrectionForm ? 'Masquer les corrections' : 'Suggérer des corrections'}
          </button>
          
          {showCorrectionForm && (
            <div className="p-4 bg-gray-50 dark:bg-gray-900/30 rounded-md mb-4">
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <div className="flex-1">
                  <label htmlFor="field" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Champ à corriger
                  </label>
                  <select
                    id="field"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
                    value={currentCorrection.field}
                    onChange={(e) => setCurrentCorrection({ ...currentCorrection, field: e.target.value })}
                  >
                    <option value="">Sélectionnez un champ</option>
                    <option value="montantHT">Montant HT</option>
                    <option value="montantTTC">Montant TTC</option>
                    <option value="tva">TVA</option>
                    <option value="dateFacture">Date de facture</option>
                    <option value="dateEcheance">Date d'échéance</option>
                    <option value="numeroFacture">Numéro de facture</option>
                    <option value="fournisseur.nom">Nom du fournisseur</option>
                    <option value="fournisseur.adresse">Adresse du fournisseur</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label htmlFor="value" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Valeur correcte
                  </label>
                  <input
                    type="text"
                    id="value"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
                    value={currentCorrection.value}
                    onChange={(e) => setCurrentCorrection({ ...currentCorrection, value: e.target.value })}
                  />
                </div>
                <div className="self-end">
                  <button
                    className="px-3 py-2 bg-secondary dark:bg-gray-700 text-text-primary dark:text-gray-200 rounded-md hover:bg-secondary/80 dark:hover:bg-gray-600"
                    onClick={addCorrection}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
              
              {corrections.length > 0 && (
                <div className="mt-3">
                  <h4 className="text-sm font-medium mb-2">Corrections suggérées :</h4>
                  <ul className="text-sm bg-white dark:bg-gray-800 border rounded-md divide-y">
                    {corrections.map((correction, index) => (
                      <li key={index} className="flex justify-between items-center p-2">
                        <span className="font-medium">{correction.field}:</span>
                        <span>{correction.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Panneau d'explication IA */}
      {selectedSuggestion?.explanationSummary && (
        <div className="mb-6">
          <ExplanationPanel
            explanationSummary={selectedSuggestion.explanationSummary}
            explanationDetails={selectedSuggestion.explanationDetails}
            explanationFactors={selectedSuggestion.explanationFactors}
            onFeedback={handleExplanationFeedback}
            expanded={false}
          />
        </div>
      )}
      
      <div className="mb-6">
        <label htmlFor="comments" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Commentaires (optionnel)
        </label>
        <textarea
          id="comments"
          rows={3}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-800 dark:border-gray-700"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Ajoutez des précisions sur votre feedback..."
        ></textarea>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Annuler
        </button>
        <button
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          onClick={handleSubmit}
          disabled={isCorrect === null || isSubmitting}
        >
          <FiSend className="mr-2" />
          {isSubmitting ? 'Envoi...' : 'Envoyer feedback'}
        </button>
      </div>
    </div>
  );
};

export default FeedbackForm;
