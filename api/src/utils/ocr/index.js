/**
 * Point d'entrée principal du module OCR hybride
 * Exporte toutes les fonctionnalités du module pour une utilisation simplifiée
 */

const { extractTextFromInvoice } = require('./ocrService');
const { extractTextFromPdf } = require('./pdfTextExtractor');
const { extractTextFromPdfViaOcr, extractTextFromImage } = require('./imageOcrProcessor');
const { ERROR_CODES, formatError } = require('./errorHandler');

/**
 * Module OCR hybride pour l'extraction de texte depuis des factures et documents
 * Combine l'extraction directe de texte (PDF natifs) et l'OCR sur images
 * 
 * Principales fonctionnalités:
 * - Extraction de texte des PDF natifs via pdf-parse
 * - Extraction OCR des PDF scannés via pdftoppm + Tesseract
 * - Extraction OCR des images via Tesseract
 * - Mécanisme de fallback automatique si l'extraction directe échoue
 * - Gestion complète des erreurs avec codes et messages utilisateur
 */
module.exports = {
  // Fonction principale
  extractTextFromInvoice,
  
  // Fonctions spécialisées
  extractTextFromPdf,
  extractTextFromPdfViaOcr,
  extractTextFromImage,
  
  // Utilitaires d'erreur
  ERROR_CODES: {
    FILE_NOT_FOUND: 'OCR_FILE_NOT_FOUND',
    INVALID_FILE_FORMAT: 'OCR_INVALID_FILE_FORMAT',
    PDF_EXTRACTION_FAILED: 'OCR_PDF_EXTRACTION_FAILED',
    IMAGE_OCR_FAILED: 'OCR_IMAGE_EXTRACTION_FAILED',
    CORRUPTED_PDF: 'OCR_CORRUPTED_PDF',
    UNSUPPORTED_FORMAT: 'OCR_UNSUPPORTED_FORMAT',
    GENERAL_ERROR: 'OCR_GENERAL_ERROR',
    EMPTY_TEXT_RESULT: 'OCR_EMPTY_TEXT_RESULT'
  },
  formatError
};
