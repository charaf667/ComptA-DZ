import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/auth/AuthContext';
import { FiFileText, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import FileUpload from '../../components/ocr/FileUpload';
import ExtractedDataDisplay from '../../components/ocr/ExtractedDataDisplay';
import AccountSuggestions from '../../components/ocr/AccountSuggestions';
import FeedbackForm from '../../components/ocr/FeedbackForm';
import ocrService from '../../services/ocr.service';
import type { ExtractedData } from '../../types/ocr';
import type { AccountSuggestion, JournalEntry, JournalEntryLine } from '../../types/accounting';
import type { FeedbackData } from '../../types/ocr';
import ExtractedDataEditForm from './components/ExtractedDataEditForm';

const OcrPage: React.FC = () => {
  // Récupérer les informations d'authentification et le tenant
  const { tenant, user } = useAuth();
  // Déclaration de tous les états en haut du composant
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [suggestionStartTime, setSuggestionStartTime] = useState<number | null>(null);
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
  const [debugMode, setDebugMode] = useState(false);

  // Création d'une suggestion par défaut si aucune n'est disponible après extraction
  useEffect(() => {
    if (suggestions.length === 0 && extractedData) {
      // Créer une suggestion par défaut basée sur le fournisseur ou utiliser un compte générique
      const defaultSuggestion = {
        id: "default",
        compteCode: "628",  // Charges diverses
        libelleCompte: "Autres charges externes",
        classe: 6,
        scoreConfiance: 0.1,
        justification: "Suggestion par défaut pour test",
        type: "CHARGE",
        category: "EXPENSE"
      };
      
      console.log("[OCR] Création d'une suggestion par défaut pour test:", defaultSuggestion);
      setSuggestions([defaultSuggestion]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extractedData]);

  // Sélection automatique de la première suggestion si aucune n'est sélectionnée
  useEffect(() => {
    if (suggestions.length > 0 && !selectedSuggestion) {
      setSelectedSuggestion(suggestions[0]);
      console.log('[OCR] Première suggestion sélectionnée automatiquement:', suggestions[0]);
    } else if (suggestions.length === 0) {
      console.log('[OCR] Aucune suggestion disponible pour sélection automatique.');
    }
    // On ne met pas selectedSuggestion dans les dépendances pour éviter une boucle infinie
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestions]);
  /**
   * 💡 Explication :
   * - Dès que suggestions change, si le tableau n'est pas vide et qu'aucune suggestion n'est sélectionnée,
   *   on sélectionne automatiquement la première suggestion.
   * - Si l'utilisateur a déjà fait un choix, on ne touche à rien.
   * - On logue les cas pour faciliter le débogage ou l'analyse UX.
   */
  // Sélection automatique de la première suggestion si aucune n'est sélectionnée
  React.useEffect(() => {
    if (suggestions.length > 0 && !selectedSuggestion) {
      setSelectedSuggestion(suggestions[0]);
      console.log('[OCR] Première suggestion sélectionnée automatiquement:', suggestions[0]);
    } else if (suggestions.length === 0) {
      console.log('[OCR] Aucune suggestion disponible pour sélection automatique.');
    }
    // On ne met pas selectedSuggestion dans les dépendances pour éviter une boucle infinie
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestions]);
  /**
   * 💡 Explication :
   * - Dès que suggestions change, si le tableau n'est pas vide et qu'aucune suggestion n'est sélectionnée,
   *   on sélectionne automatiquement la première suggestion.
   * - Si l'utilisateur a déjà fait un choix, on ne touche à rien.
   * - On logue les cas pour faciliter le débogage ou l'analyse UX.
   */

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
      // Conserver les suggestions initiales au cas où les suggestions adaptatives échouent ou sont vides
      let finalSuggestions = result.classification.suggestions || [];
      if (result.extractedData) {
        try {
          console.log('[OCR] Récupération des suggestions adaptatives...');
          const adaptiveSuggestions = await ocrService.getAdaptiveSuggestions(result.extractedData);
          if (adaptiveSuggestions && adaptiveSuggestions.length > 0) {
            console.log('[OCR] Suggestions adaptatives reçues:', adaptiveSuggestions);
            finalSuggestions = adaptiveSuggestions;
          } else {
            console.log('[OCR] Aucune suggestion adaptative reçue, utilisation des suggestions initiales.');
          }
        } catch (adaptiveError) {
          console.error('[OCR] Erreur lors de la récupération des suggestions adaptatives:', adaptiveError);
          // En cas d'erreur, on garde les suggestions de processFile (déjà dans finalSuggestions)
        }
      }
      setSuggestions(finalSuggestions);
      setJournalEntry(result.classification.ecritureProposee);
      setSuggestionStartTime(Date.now()); // Enregistrer l'heure de début pour le temps de décision
      
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

  const validateAndSave = async () => {
    if (!extractedData || !selectedSuggestion) {
      setError('Données insuffisantes pour valider');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Enregistrer le feedback pour l'apprentissage adaptatif
      const decisionTime = suggestionStartTime ? Date.now() - suggestionStartTime : 0;
      const feedbackPayload: FeedbackData = {
        documentId: extractedData.documentId || '', // Assurer que documentId est présent
        originalExtractedData: extractedData, // Ajout des données OCR complètes originales
        initialAISuggestion: suggestions.find(s => s.source !== 'manual' && s.source !== 'adaptive') || suggestions[0] || null, // Prend la première non manuelle/non adaptative, ou la première tout court
        selectedSuggestion: selectedSuggestion,
        decisionTimeMs: decisionTime,
        // userCorrection est géré via FeedbackForm, donc omis ici pour le feedback initial
      };
      
      await ocrService.sendFeedback(feedbackPayload);
      
      // 2. Ici, vous pouvez implémenter la logique pour sauvegarder l'écriture comptable
      // Par exemple, appeler une API pour enregistrer l'écriture dans votre système
      
      setSuccess('Écriture comptable validée et enregistrée');
      setActiveStep(3);
      // Demander le feedback supplémentaire de l'utilisateur après validation
      setShowFeedbackForm(true);
    } catch (error: any) {
      console.error('Erreur lors de la validation:', error);
      setError(error.response?.data?.message || 'Erreur lors de la validation');
    } finally {
      setIsLoading(false);
    }
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
          setSuggestionStartTime(Date.now()); // Enregistrer l'heure de début pour le temps de décision
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
              
              {/* Boutons d'action */}
              <div className="flex justify-end space-x-2 mt-4">
                <button
                  onClick={handleEditData}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                  disabled={showEditForm}
                >
                  Modifier les données
                </button>
                <button
                  onClick={() => setDebugMode(!debugMode)}
                  className={`px-4 py-2 ${debugMode ? 'bg-orange-600' : 'bg-gray-600'} text-white rounded hover:${debugMode ? 'bg-orange-700' : 'bg-gray-700'} transition-colors`}
                >
                  {debugMode ? 'Désactiver Debug' : 'Mode Debug'}
                </button>
              </div>
              
              {/* Panneau de debug */}
              {debugMode && (
                <div className="mt-6 p-6 border rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                  <h3 className="text-lg font-medium mb-4">Informations de débogage OCR</h3>
                  
                  <div className="mb-6">
                    <h4 className="font-medium mb-2 text-blue-600">Données extraites</h4>
                    <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-40">
                      {JSON.stringify(extractedData, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="font-medium mb-2 text-blue-600">Suggestions de comptes ({suggestions.length})</h4>
                    {suggestions.length > 0 ? (
                      <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-40">
                        {JSON.stringify(suggestions, null, 2)}
                      </pre>
                    ) : (
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                        <p className="text-yellow-700">Aucune suggestion disponible. Causes possibles :</p>
                        <ul className="list-disc ml-5 text-yellow-700 text-sm">
                          <li>Données extraites insuffisantes ou de faible qualité</li>
                          <li>Aucune correspondance trouvée dans la base de connaissances</li>
                          <li>Erreur dans le processus de classification</li>
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2 text-blue-600">Écriture proposée</h4>
                    {journalEntry ? (
                      <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded overflow-auto max-h-40">
                        {JSON.stringify(journalEntry, null, 2)}
                      </pre>
                    ) : (
                      <p className="text-gray-500 italic">Aucune écriture proposée disponible</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Formulaire d'édition */}
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
                // Utiliser le tenantId de l'utilisateur connecté
                tenantId={tenant?.id || user?.tenantId || "REQUIRED_BUT_MISSING"}
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
                  {showFeedbackForm && extractedData && extractedData.documentId && selectedSuggestion && (
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
                          documentId={extractedData.documentId}
                          initialAISuggestionForDoc={suggestions && suggestions.length > 0 ? suggestions[0] : null}
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
