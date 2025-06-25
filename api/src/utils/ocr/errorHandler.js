/**
 * Gestionnaire d'erreurs pour le module OCR
 * Permet de formater les erreurs avec des codes spécifiques et des messages utilisateur clairs
 */

/**
 * Codes d'erreur standardisés pour le module OCR
 */
const ERROR_CODES = {
  FILE_NOT_FOUND: 'OCR_FILE_NOT_FOUND',
  ACCESS_DENIED: 'OCR_ACCESS_DENIED',
  INVALID_FILE_FORMAT: 'OCR_INVALID_FILE_FORMAT',
  CORRUPTED_PDF: 'OCR_CORRUPTED_PDF',
  PDF_EXTRACTION_FAILED: 'OCR_PDF_EXTRACTION_FAILED',
  PDFTOPPM_FAILED: 'OCR_PDFTOPPM_FAILED',
  TESSERACT_FAILED: 'OCR_TESSERACT_FAILED',
  TEMP_DIR_CREATION_FAILED: 'OCR_TEMP_DIR_CREATION_FAILED',
  EMPTY_TEXT_RESULT: 'OCR_EMPTY_TEXT_RESULT',
  UNKNOWN_ERROR: 'OCR_UNKNOWN_ERROR'
};

/**
 * Crée une erreur formatée avec un code, un message et des détails optionnels
 * @param {string} code - Code d'erreur prédéfini dans ERROR_CODES
 * @param {any} details - Détails additionnels sur l'erreur (facultatif)
 * @returns {Error} - Instance d'erreur enrichie
 */
function formatError(code, details = null) {
  const messages = {
    [ERROR_CODES.FILE_NOT_FOUND]: 'Le fichier spécifié est introuvable. Vérifiez que le chemin est correct.',
    [ERROR_CODES.ACCESS_DENIED]: 'Accès au fichier refusé. Vérifiez les permissions du fichier.',
    [ERROR_CODES.INVALID_FILE_FORMAT]: 'Format de fichier non pris en charge. Seuls les PDF, JPEG, PNG et TIFF sont acceptés.',
    [ERROR_CODES.CORRUPTED_PDF]: 'Le PDF semble corrompu ou mal formaté. Vérifiez que le fichier est valide ou contactez l\'administrateur.',
    [ERROR_CODES.PDF_EXTRACTION_FAILED]: 'Échec de l\'extraction directe du texte du PDF. Tentative d\'extraction par OCR en cours...',
    [ERROR_CODES.PDFTOPPM_FAILED]: 'Échec de la conversion du PDF en images. Vérifiez que Poppler (pdftoppm) est correctement installé.',
    [ERROR_CODES.TESSERACT_FAILED]: 'Échec du traitement OCR. Vérifiez que Tesseract est correctement installé avec les langues requises.',
    [ERROR_CODES.TEMP_DIR_CREATION_FAILED]: 'Impossible de créer un dossier temporaire pour le traitement OCR.',
    [ERROR_CODES.EMPTY_TEXT_RESULT]: 'L\'extraction OCR n\'a retourné aucun texte. Le document est peut-être vide ou illisible.',
    [ERROR_CODES.UNKNOWN_ERROR]: 'Une erreur inconnue est survenue pendant le traitement OCR.'
  };

  const message = messages[code] || messages[ERROR_CODES.UNKNOWN_ERROR];
  const error = new Error(message);
  
  // Enrichir l'erreur avec des propriétés supplémentaires
  error.code = code;
  error.details = details;
  error.timestamp = new Date().toISOString();
  
  return error;
}

module.exports = {
  ERROR_CODES,
  formatError
};
