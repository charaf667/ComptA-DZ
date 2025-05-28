import React, { useState } from 'react';
import { FiFileText, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import FileUpload from '../../components/ocr/FileUpload';
import ExtractedDataDisplay from '../../components/ocr/ExtractedDataDisplay';
import AccountSuggestions from '../../components/ocr/AccountSuggestions';
import FeedbackForm from '../../components/ocr/FeedbackForm';
import ocrService from '../../services/ocr.service';
import type { ExtractedData } from '../../types/ocr';
import type { AccountSuggestion, JournalEntry, JournalEntryLine } from '../../types/accounting';
import ExtractedDataEditForm from './components/ExtractedDataEditForm';

const OcrPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [suggestions, setSuggestions] = useState<AccountSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<AccountSuggestion | null>(null);
  const [journalEntry, setJournalEntry] = useState<JournalEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [isFeedbackSubmitting, setIsFeedbackSubmitting] = useState(false);
  const [editingData, setEditingData] = useState<ExtractedData | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isEditSaving, setIsEditSaving] = useState(false);

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setSuccess(null);
    setActiveStep(1);
    setExtractedData(null);
    setSuggestions([]);
    setSelectedSuggestion(null);
    setJournalEntry(null);
  };

  // Validation du fichier avant envoi au serveur
  const validateFile = (file: File): boolean => {
    // Vérification de la taille (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError(`Le fichier est trop volumineux. Taille maximale: ${maxSize / (1024 * 1024)}MB`);
      return false;
    }

    // Vérification du type pour les PDF
    if (file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setError('Le fichier a une extension PDF mais un type incorrect. Veuillez vérifier le fichier.');
      return false;
    }

    // Vérification des types d'image
    if (['jpg', 'jpeg'].some(ext => file.name.toLowerCase().endsWith(`.${ext}`)) && !file.type.includes('jpeg')) {
      setError('Le fichier a une extension JPG mais un type incorrect. Veuillez vérifier le fichier.');
      return false;
    }

    if (file.name.toLowerCase().endsWith('.png') && !file.type.includes('png')) {
      setError('Le fichier a une extension PNG mais un type incorrect. Veuillez vérifier le fichier.');
      return false;
    }

    return true;
  };

  const processFile = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    // Validation du fichier avant envoi
    if (!validateFile(file)) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const result = await ocrService.processFile(file);
      
      // Vérifier si les données extraites sont valides
      if (!result.extractedData || Object.keys(result.extractedData).length === 0) {
        setError('Aucune donnée n\'a pu être extraite du document. Veuillez vérifier le fichier et réessayer.');
        return;
      }
      
      setExtractedData(result.extractedData);
      setSuggestions(result.classification.suggestions);
      setJournalEntry(result.classification.ecritureProposee);
      
      if (result.classification.suggestions.length > 0) {
        setSelectedSuggestion(result.classification.suggestions[0]);
      }
      
      setActiveStep(2);
      setSuccess('Document traité avec succès');
    } catch (err: any) {
      console.error('Erreur lors du traitement du document:', err);
      
      // Gestion des erreurs spécifiques
      if (err.response && err.response.data) {
        const { message, details } = err.response.data;
        
        // Erreur spécifique pour les PDF corrompus
        if (message && message.includes('PDF est corrompu')) {
          setError(`Le fichier PDF est corrompu ou mal formaté. Veuillez vérifier le fichier ou essayer avec un autre document.`);
        } 
        // Erreur avec détails supplémentaires
        else if (message && details) {
          setError(`${message}: ${details}`);
        }
        // Message d'erreur générique du serveur
        else if (message) {
          setError(message);
        } else {
          setError('Une erreur est survenue lors du traitement du document');
        }
      } else if (err.message) {
        // Erreur réseau ou autre erreur avec message
        setError(`Erreur: ${err.message}`);
      } else {
        // Erreur générique
        setError('Une erreur inconnue est survenue lors du traitement du document');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionSelect = (suggestion: AccountSuggestion) => {
    setSelectedSuggestion(suggestion);
  };

  const validateAndSave = () => {
    if (!extractedData || !selectedSuggestion) {
      setError('Données insuffisantes pour valider');
      return;
    }

    // Ici, vous pouvez implémenter la logique pour sauvegarder l'écriture comptable
    // Par exemple, appeler une API pour enregistrer l'écriture dans votre système

    setSuccess('Écriture comptable validée et enregistrée');
    setActiveStep(3);
    // Demander le feedback de l'utilisateur après validation
    setShowFeedbackForm(true);
  };
  
  const handleFeedbackSubmit = async (feedbackData: any) => {
    try {
      setIsFeedbackSubmitting(true);
      await ocrService.sendFeedback(feedbackData);
      setSuccess('Merci pour votre feedback! Vos commentaires nous aident à améliorer notre système.');
      setShowFeedbackForm(false);
    } catch (err) {
      console.error('Erreur lors de l\'envoi du feedback:', err);
      setError('Une erreur est survenue lors de l\'envoi de votre feedback. Veuillez réessayer.');
    } finally {
      setIsFeedbackSubmitting(false);
    }
  };
  
  const handleFeedbackCancel = () => {
    setShowFeedbackForm(false);
  };

  const handleEditData = () => {
    if (extractedData) {
      setEditingData({ ...extractedData }); // Create a copy
      setShowEditForm(true);
      setError(null);
      setSuccess(null);
    }
  };

  const handleSaveEditedData = async (updatedData: ExtractedData) => {
    setIsEditSaving(true);
    setError(null);
    
    try {
      // Appel au service OCR pour sauvegarder les données modifiées
      const savedData = await ocrService.saveEditedData(updatedData, updatedData.documentId);
      
      // Mise à jour des données extraites avec les données sauvegardées
      setExtractedData(savedData);
      
      // Réinitialisation des états
      setShowEditForm(false);
      setEditingData(null);
      setSuccess('Données mises à jour avec succès.');
      
      // Optionnellement, déclencher une nouvelle classification si nécessaire
      // Si les modifications affectent la classification, nous pourrions vouloir la mettre à jour
      if (updatedData.libelle !== extractedData?.libelle || updatedData.montant !== extractedData?.montant) {
        try {
          const newClassification = await ocrService.classifyDocument(savedData);
          setSuggestions(newClassification.suggestions);
          setJournalEntry(newClassification.ecritureProposee);
        } catch (classifyError) {
          console.error('Erreur lors de la reclassification après modification:', classifyError);
          // Ne pas bloquer le flux principal en cas d'échec de la reclassification
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde des données modifiées:', error);
      setError(
        error.response?.data?.message || 
        'Une erreur est survenue lors de la sauvegarde des données modifiées.'
      );
    } finally {
      setIsEditSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingData(null);
  };

  const resetForm = () => {
    setFile(null);
    setExtractedData(null);
    setSuggestions([]);
    setSelectedSuggestion(null);
    setJournalEntry(null);
    setActiveStep(1);
    setError(null);
    setSuccess(null);
    setShowFeedbackForm(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">OCR & Classification de Documents</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Téléchargez une facture pour extraire automatiquement ses données et obtenir des suggestions de comptes comptables.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-error/30 dark:border-error/50 rounded-lg text-error flex items-center">
          <FiAlertTriangle className="mr-2 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/20 border border-success/30 dark:border-success/50 rounded-lg text-success flex items-center">
          <FiCheckCircle className="mr-2 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/3 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border">
            <h2 className="text-xl font-semibold mb-4">1. Téléchargement</h2>
            <FileUpload onFileSelect={handleFileSelect} />
            
            {file && (
              <div className="mt-4">
                <button
                  className="w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={processFile}
                  disabled={isLoading}
                >
                  {isLoading ? 'Traitement...' : 'Traiter le document'}
                </button>
              </div>
            )}
          </div>

          {activeStep >= 2 && extractedData && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border">
              <h2 className="text-xl font-semibold mb-4">3. Validation</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Validez les données extraites et la suggestion de compte sélectionnée pour créer une écriture comptable.
              </p>
              <button
                className="w-full py-2 px-4 bg-success text-white rounded-md hover:bg-success/90 focus:outline-none focus:ring-2 focus:ring-success focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={validateAndSave}
                disabled={!selectedSuggestion || activeStep >= 3}
              >
                Valider et enregistrer
              </button>
              
              {activeStep >= 3 && (
                <button
                  className="w-full mt-2 py-2 px-4 bg-secondary dark:bg-gray-700 text-text-primary dark:text-gray-200 rounded-md hover:bg-secondary/80 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-secondary dark:focus:ring-gray-500 focus:ring-opacity-50"
                  onClick={resetForm}
                >
                  Traiter un nouveau document
                </button>
              )}
            </div>
          )}
        </div>

        <div className="lg:w-2/3 space-y-6">
          {activeStep >= 2 && extractedData && (
            <>
              <ExtractedDataDisplay data={extractedData} />
              {!showEditForm && (
                <div className="mt-4 text-right">
                  <button
                    onClick={handleEditData}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Modifier les Données
                  </button>
                </div>
              )}
              {showEditForm && editingData && (
                <div className="mt-6">
                  {isEditSaving ? (
                    <div className="flex items-center justify-center p-6 bg-white rounded-lg shadow">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mr-3"></div>
                      <p className="text-gray-700">Sauvegarde des modifications en cours...</p>
                    </div>
                  ) : (
                    <ExtractedDataEditForm 
                      initialData={editingData}
                      onSave={handleSaveEditedData}
                      onCancel={handleCancelEdit}
                    />
                  )}
                </div>
              )}
              <AccountSuggestions
                suggestions={suggestions}
                onSelectSuggestion={handleSuggestionSelect}
                selectedSuggestion={selectedSuggestion || undefined}
              />

              {journalEntry && (
                <div className="p-6 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                  <h3 className="text-lg font-medium mb-4">Écriture comptable proposée</h3>
                  
                  <div className="mb-3">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Date</p>
                    <p className="font-medium">{journalEntry.date}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Libellé</p>
                    <p className="font-medium">{journalEntry.libelle}</p>
                  </div>
                  
                  {/* Afficher le formulaire de feedback si nécessaire */}
                  {showFeedbackForm && extractedData && selectedSuggestion && (
                    <div className="mt-6">
                      {isFeedbackSubmitting ? (
                        <div className="p-6 border rounded-lg bg-white dark:bg-gray-800 shadow-sm text-center">
                          <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-primary-500 rounded-full mb-3" role="status" aria-label="loading">
                            <span className="sr-only">Chargement...</span>
                          </div>
                          <p>Envoi de votre feedback...</p>
                        </div>
                      ) : (
                        <FeedbackForm 
                          extractedData={extractedData}
                          selectedSuggestion={selectedSuggestion}
                          onSubmitFeedback={handleFeedbackSubmit}
                          onCancel={handleFeedbackCancel}
                        />
                      )}
                    </div>
                  )}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Compte</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Libellé</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Débit</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Crédit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {journalEntry.lignes.map((ligne: JournalEntryLine, index: number) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-900/20' : ''}>
                            <td className="px-4 py-2 text-sm font-medium">{ligne.compteCode}</td>
                            <td className="px-4 py-2 text-sm">{ligne.libelleCompte}</td>
                            <td className="px-4 py-2 text-sm text-right">
                              {ligne.montantDebit > 0 ? `${ligne.montantDebit.toFixed(2)} DZD` : ''}
                            </td>
                            <td className="px-4 py-2 text-sm text-right">
                              {ligne.montantCredit > 0 ? `${ligne.montantCredit.toFixed(2)} DZD` : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="font-medium">
                          <td className="px-4 py-2 text-sm" colSpan={2}>Total</td>
                          <td className="px-4 py-2 text-sm text-right">
                            {journalEntry.lignes.reduce((sum: number, ligne: JournalEntryLine) => sum + ligne.montantDebit, 0).toFixed(2)} DZD
                          </td>
                          <td className="px-4 py-2 text-sm text-right">
                            {journalEntry.lignes.reduce((sum: number, ligne: JournalEntryLine) => sum + ligne.montantCredit, 0).toFixed(2)} DZD
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
          
          {activeStep === 1 && !extractedData && (
            <div className="p-12 border rounded-lg bg-background dark:bg-background-dark shadow-sm text-center">
              <FiFileText className="mx-auto text-5xl text-text-secondary/50 dark:text-text-secondary/30 mb-4" />
              <h3 className="text-xl font-medium mb-2">Aucun document traité</h3>
              <p className="text-text-secondary">
                Téléchargez une facture et cliquez sur "Traiter le document" pour extraire les données et obtenir des suggestions de comptes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OcrPage;
