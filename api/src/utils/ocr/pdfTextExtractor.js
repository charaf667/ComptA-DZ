/**
 * Module d'extraction de texte directement depuis un PDF natif
 * Utilise pdf-parse pour extraire le contenu textuel des PDF bien formatés
 */

const fs = require('fs/promises');
const path = require('path');
const pdfParse = require('pdf-parse');
const { ERROR_CODES, formatError } = require('./errorHandler');

/**
 * Extrait le texte d'un fichier PDF de manière native (sans OCR)
 * @param {string} filePath - Chemin absolu vers le fichier PDF
 * @param {Object} options - Options d'extraction
 * @param {number} options.minTextLength - Longueur minimale de texte attendue (défaut: 30 caractères)
 * @returns {Promise<string>} - Texte extrait du PDF
 * @throws {Error} - Erreur formatée en cas d'échec
 */
async function extractTextFromPdf(filePath, options = {}) {
  const { minTextLength = 30 } = options;
  
  try {
    // Vérification de l'existence du fichier
    try {
      await fs.access(filePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw formatError(ERROR_CODES.FILE_NOT_FOUND, { path: filePath });
      } else if (error.code === 'EACCES') {
        throw formatError(ERROR_CODES.ACCESS_DENIED, { path: filePath });
      }
      throw error; // Autre erreur non gérée spécifiquement
    }

    // Vérification de l'extension du fichier
    const fileExt = path.extname(filePath).toLowerCase();
    if (fileExt !== '.pdf') {
      throw formatError(ERROR_CODES.INVALID_FILE_FORMAT, { 
        format: fileExt, 
        supportedFormats: ['.pdf'] 
      });
    }

    // Lecture du fichier PDF
    const dataBuffer = await fs.readFile(filePath);
    
    // Extraction du texte avec pdf-parse
    const pdfData = await pdfParse(dataBuffer);
    const extractedText = pdfData.text || '';
    
    // Vérification de la quantité de texte extraite
    if (extractedText.length < minTextLength) {
      throw formatError(ERROR_CODES.EMPTY_TEXT_RESULT, { 
        textLength: extractedText.length,
        minExpected: minTextLength,
        sample: extractedText.substring(0, 100)
      });
    }
    
    return extractedText;
    
  } catch (error) {
    // Si c'est déjà une erreur formatée, la propager
    if (error.code && error.code.startsWith('OCR_')) {
      throw error;
    }
    
    // Gestion des erreurs spécifiques à pdf-parse
    if (error.message && (
      error.message.includes('bad XRef entry') ||
      error.message.includes('Invalid number') ||
      error.message.includes('corrupted') ||
      error.message.includes('malformed')
    )) {
      throw formatError(ERROR_CODES.CORRUPTED_PDF, { originalError: error.message });
    }
    
    // Erreur générique d'extraction
    throw formatError(ERROR_CODES.PDF_EXTRACTION_FAILED, { originalError: error.message });
  }
}

module.exports = {
  extractTextFromPdf
};
