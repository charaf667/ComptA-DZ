/**
 * Service OCR hybride principal
 * Combine l'extraction directe de texte et l'OCR sur images pour une robustesse maximale
 */

const path = require('path');
const { extractTextFromPdf } = require('./pdfTextExtractor');
const { extractTextFromPdfViaOcr, extractTextFromImage } = require('./imageOcrProcessor');
const { ERROR_CODES, formatError } = require('./errorHandler');

/**
 * Extrait le texte d'une facture (PDF ou image) avec une approche hybride
 * Tente d'abord l'extraction directe, puis bascule vers l'OCR si nécessaire
 * 
 * @param {string} filePath - Chemin absolu vers le fichier à traiter
 * @param {Object} options - Options d'extraction
 * @param {string} options.languages - Langues pour Tesseract (ex: 'fra+eng+ara')
 * @param {number} options.minTextLength - Longueur minimale de texte attendue pour l'extraction directe
 * @param {number} options.dpi - Résolution pour pdftoppm (défaut: 300)
 * @param {Object} options.preprocess - Options de prétraitement d'image
 * @returns {Promise<string>} - Texte extrait du document
 * @throws {Error} - Erreur formatée en cas d'échec total
 */
async function extractTextFromInvoice(filePath, options = {}) {
  // Options par défaut
  const defaultOptions = {
    languages: 'fra+eng',
    minTextLength: 30,
    dpi: 300,
    preprocess: {
      grayscale: true,
      normalize: true,
      sharpen: true,
      resize: 2000
    }
  };

  // Fusion des options par défaut avec celles fournies
  const mergedOptions = { ...defaultOptions, ...options };
  if (options.preprocess) {
    mergedOptions.preprocess = { ...defaultOptions.preprocess, ...options.preprocess };
  }
  
  // Détermination du type de fichier
  const fileExt = path.extname(filePath).toLowerCase();
  
  // Traitement selon le type de fichier
  try {
    // 1. Pour les PDF : approche hybride
    if (fileExt === '.pdf') {
      try {
        // Tentative d'extraction directe
        console.log(`🔍 Tentative d'extraction directe du texte du PDF: ${filePath}`);
        const directText = await extractTextFromPdf(filePath, {
          minTextLength: mergedOptions.minTextLength
        });
        console.log(`✅ Extraction directe réussie (${directText.length} caractères)`);
        return directText;
      } catch (error) {
        // Si l'erreur est liée à un PDF corrompu ou à un manque de texte
        // On bascule vers la méthode OCR
        console.warn(`⚠️ Échec de l'extraction directe: ${error.message}`);
        console.log(`🔄 Basculement vers l'extraction OCR via images...`);
        
        if (
          error.code === ERROR_CODES.CORRUPTED_PDF || 
          error.code === ERROR_CODES.PDF_EXTRACTION_FAILED ||
          error.code === ERROR_CODES.EMPTY_TEXT_RESULT
        ) {
          // Tentative de fallback avec OCR
          const ocrText = await extractTextFromPdfViaOcr(filePath, {
            languages: mergedOptions.languages,
            dpi: mergedOptions.dpi,
            preprocess: mergedOptions.preprocess
          });
          console.log(`✅ Extraction OCR réussie (${ocrText.length} caractères)`);
          return ocrText;
        }
        
        // Pour les autres erreurs (fichier inexistant, etc.), on les propage
        throw error;
      }
    }
    
    // 2. Pour les images : OCR directement
    else if (['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.bmp'].includes(fileExt)) {
      console.log(`🔍 Traitement OCR de l'image: ${filePath}`);
      const imageText = await extractTextFromImage(filePath, {
        languages: mergedOptions.languages,
        preprocess: mergedOptions.preprocess
      });
      console.log(`✅ OCR image réussi (${imageText.length} caractères)`);
      return imageText;
    }
    
    // 3. Format non supporté
    else {
      throw formatError(ERROR_CODES.INVALID_FILE_FORMAT, {
        format: fileExt,
        supportedFormats: ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.tif', '.bmp']
      });
    }
    
  } catch (error) {
    // Propager les erreurs déjà formatées
    if (error.code && error.code.startsWith('OCR_')) {
      console.error(`❌ Échec OCR: [${error.code}] ${error.message}`);
      throw error;
    }
    
    // Formater les erreurs inconnues
    console.error(`❌ Erreur inattendue: ${error.message}`);
    throw formatError(ERROR_CODES.UNKNOWN_ERROR, { originalError: error.message });
  }
}

module.exports = {
  extractTextFromInvoice,
  // Exporter également les fonctions individuelles pour des tests ou utilisations spécifiques
  extractTextFromPdf,
  extractTextFromPdfViaOcr,
  extractTextFromImage
};
