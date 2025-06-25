"use strict";
/**
 * Module OCR hybride pour l'extraction de texte depuis les factures
 * Ce module consolide les diverses méthodes d'extraction de texte
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_CODES = void 0;
exports.extractTextFromInvoice = extractTextFromInvoice;
exports.extractTextFromPdf = extractTextFromPdf;
exports.extractTextFromImage = extractTextFromImage;
// Codes d'erreur pour faciliter la gestion des erreurs
exports.ERROR_CODES = {
    FILE_NOT_FOUND: 'OCR_FILE_NOT_FOUND',
    INVALID_FILE_FORMAT: 'OCR_INVALID_FILE_FORMAT',
    PDF_EXTRACTION_FAILED: 'OCR_PDF_EXTRACTION_FAILED',
    IMAGE_OCR_FAILED: 'OCR_IMAGE_EXTRACTION_FAILED',
    CORRUPTED_PDF: 'OCR_CORRUPTED_PDF',
    UNSUPPORTED_FORMAT: 'OCR_UNSUPPORTED_FORMAT',
    GENERAL_ERROR: 'OCR_GENERAL_ERROR',
    EMPTY_TEXT_RESULT: 'OCR_EMPTY_TEXT_RESULT'
};
// Fonction principale pour extraire du texte d'une facture (auto-détection du type)
async function extractTextFromInvoice(filePath, options) {
    const fileExt = filePath.toLowerCase().split('.').pop();
    switch (fileExt) {
        case 'pdf':
            return extractTextFromPdf(filePath, options);
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'tiff':
        case 'webp':
            return extractTextFromImage(filePath, options);
        default:
            throw new Error(`Format non supporté: ${fileExt}`);
    }
}
// Fonction d'extraction de texte depuis un PDF
async function extractTextFromPdf(filePath, options) {
    try {
        // Simuler l'extraction de texte d'un PDF
        // Dans une implémentation réelle, cette fonction utiliserait pdfjs-extract ou similaire
        console.log(`[MODULE OCR] Extraction depuis PDF: ${filePath}`);
        return "Texte extrait du PDF (simulé)";
    }
    catch (error) {
        console.error("Erreur d'extraction PDF:", error);
        throw {
            code: exports.ERROR_CODES.PDF_EXTRACTION_FAILED,
            message: `Extraction de texte depuis le PDF échouée: ${error}`,
            originalError: error
        };
    }
}
// Fonction d'extraction de texte depuis une image
async function extractTextFromImage(filePath, options) {
    try {
        // Simuler l'extraction de texte d'une image
        // Dans une implémentation réelle, cette fonction utiliserait tesseract.js
        console.log(`[MODULE OCR] Extraction depuis image: ${filePath} avec langues: ${options?.languages || 'fra+eng'}`);
        return "Texte extrait de l'image (simulé)";
    }
    catch (error) {
        console.error("Erreur d'extraction d'image:", error);
        throw {
            code: exports.ERROR_CODES.IMAGE_OCR_FAILED,
            message: `OCR de l'image échouée: ${error}`,
            originalError: error
        };
    }
}
// Exporter d'autres fonctionnalités si nécessaire
exports.default = {
    extractTextFromInvoice,
    extractTextFromPdf,
    extractTextFromImage,
    ERROR_CODES: exports.ERROR_CODES
};
