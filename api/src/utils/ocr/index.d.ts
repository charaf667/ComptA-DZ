/**
 * Définitions de types pour le module OCR hybride
 */

/**
 * Codes d'erreur standardisés pour le module OCR
 */
export const enum ERROR_CODES {
  FILE_NOT_FOUND = 'OCR_FILE_NOT_FOUND',
  ACCESS_DENIED = 'OCR_ACCESS_DENIED',
  INVALID_FILE_FORMAT = 'OCR_INVALID_FILE_FORMAT',
  CORRUPTED_PDF = 'OCR_CORRUPTED_PDF',
  PDF_EXTRACTION_FAILED = 'OCR_PDF_EXTRACTION_FAILED',
  PDFTOPPM_FAILED = 'OCR_PDFTOPPM_FAILED',
  TESSERACT_FAILED = 'OCR_TESSERACT_FAILED',
  TEMP_DIR_CREATION_FAILED = 'OCR_TEMP_DIR_CREATION_FAILED',
  EMPTY_TEXT_RESULT = 'OCR_EMPTY_TEXT_RESULT',
  UNKNOWN_ERROR = 'OCR_UNKNOWN_ERROR'
}

/**
 * Options pour le prétraitement d'images
 */
export interface PreprocessOptions {
  grayscale?: boolean;
  normalize?: boolean;
  sharpen?: boolean;
  resize?: number;
}

/**
 * Options pour l'extraction de texte
 */
export interface ExtractionOptions {
  languages?: string;
  minTextLength?: number;
  dpi?: number;
  preprocess?: PreprocessOptions;
}

/**
 * Erreur formatée avec code et détails
 */
export interface OcrError extends Error {
  code: string;
  details?: any;
  timestamp?: string;
}

/**
 * Fonction principale d'extraction de texte d'une facture
 * @param filePath - Chemin absolu vers le fichier
 * @param options - Options d'extraction
 */
export function extractTextFromInvoice(
  filePath: string, 
  options?: ExtractionOptions
): Promise<string>;

/**
 * Extrait le texte d'un fichier PDF de manière native
 * @param filePath - Chemin absolu vers le fichier PDF
 * @param options - Options d'extraction
 */
export function extractTextFromPdf(
  filePath: string, 
  options?: Pick<ExtractionOptions, 'minTextLength'>
): Promise<string>;

/**
 * Extrait le texte d'un PDF via OCR
 * @param filePath - Chemin absolu vers le fichier PDF
 * @param options - Options d'extraction
 */
export function extractTextFromPdfViaOcr(
  filePath: string, 
  options?: ExtractionOptions
): Promise<string>;

/**
 * Extrait le texte d'une image
 * @param imagePath - Chemin absolu vers le fichier image
 * @param options - Options d'extraction
 */
export function extractTextFromImage(
  imagePath: string, 
  options?: Pick<ExtractionOptions, 'languages' | 'preprocess'>
): Promise<string>;

/**
 * Crée une erreur formatée avec code et détails
 * @param code - Code d'erreur
 * @param details - Détails additionnels
 */
export function formatError(code: string, details?: any): OcrError;
