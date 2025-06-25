/**
 * Module de traitement OCR d'images
 * Gère la conversion PDF vers images et l'extraction de texte via Tesseract
 */

const fs = require('fs/promises');
const fsExtra = require('fs-extra');
const path = require('path');
const os = require('os');
const { exec } = require('child_process');
const util = require('util');
const sharp = require('sharp');
const tesseract = require('node-tesseract-ocr');
const { ERROR_CODES, formatError } = require('./errorHandler');

// Convertir exec en version Promise
const execPromise = util.promisify(exec);

/**
 * Extrait le texte d'un PDF en le convertissant d'abord en images avec pdftoppm
 * puis en appliquant Tesseract OCR sur chaque image
 * 
 * @param {string} filePath - Chemin absolu vers le fichier PDF
 * @param {Object} options - Options d'extraction
 * @param {string} options.languages - Langues pour Tesseract (ex: 'fra+eng')
 * @param {number} options.dpi - Résolution pour pdftoppm (défaut: 300)
 * @param {Object} options.preprocess - Options de prétraitement d'image
 * @returns {Promise<string>} - Texte extrait du PDF via OCR
 * @throws {Error} - Erreur formatée en cas d'échec
 */
async function extractTextFromPdfViaOcr(filePath, options = {}) {
  const { 
    languages = 'fra+eng', 
    dpi = 300,
    preprocess = {
      grayscale: true,
      normalize: true,
      sharpen: true,
      resize: 2000
    }
  } = options;

  let tempDir = null;
  
  try {
    // Création d'un dossier temporaire unique
    tempDir = path.join(os.tmpdir(), `ocr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
    await fsExtra.ensureDir(tempDir);
    
    // Configuration de base pour tesseract
    const tesseractConfig = {
      lang: languages,
      oem: 1,  // Mode OCR Engine - 1 = Neural nets LSTM
      psm: 3,  // Page Segmentation Mode - 3 = Fully automatic page segmentation
    };
    
    // Exécution de pdftoppm pour convertir le PDF en images
    const baseOutputName = path.join(tempDir, 'page');
    const pdftoppmCommand = `pdftoppm -png -r ${dpi} "${filePath}" "${baseOutputName}"`;
    
    try {
      await execPromise(pdftoppmCommand);
    } catch (error) {
      throw formatError(ERROR_CODES.PDFTOPPM_FAILED, { 
        command: pdftoppmCommand,
        error: error.message
      });
    }
    
    // Récupération des images générées (triées par numéro de page)
    const imageFiles = (await fs.readdir(tempDir))
      .filter(file => file.endsWith('.png'))
      .sort((a, b) => {
        const numA = parseInt(a.match(/page-(\d+)\.png/)?.[1] || '0');
        const numB = parseInt(b.match(/page-(\d+)\.png/)?.[1] || '0');
        return numA - numB;
      });
    
    if (imageFiles.length === 0) {
      throw formatError(ERROR_CODES.PDFTOPPM_FAILED, { 
        reason: 'Aucune image générée',
        tempDir
      });
    }
    
    // Traitement OCR sur chaque image
    let fullText = '';
    
    for (const imageFile of imageFiles) {
      const imagePath = path.join(tempDir, imageFile);
      const processedImagePath = path.join(tempDir, `proc_${imageFile}`);
      
      // Prétraitement de l'image avec sharp
      const imageProcessor = sharp(imagePath);
      
      if (preprocess.grayscale) {
        imageProcessor.grayscale();
      }
      
      if (preprocess.normalize) {
        imageProcessor.normalize();
      }
      
      if (preprocess.sharpen) {
        imageProcessor.sharpen();
      }
      
      if (preprocess.resize) {
        imageProcessor.resize({
          width: preprocess.resize,
          withoutEnlargement: true
        });
      }
      
      // Sauvegarde de l'image prétraitée
      await imageProcessor.toFile(processedImagePath);
      
      // Exécution de Tesseract OCR sur l'image prétraitée
      try {
        const pageText = await tesseract.recognize(processedImagePath, tesseractConfig);
        fullText += pageText + '\n';
      } catch (error) {
        throw formatError(ERROR_CODES.TESSERACT_FAILED, { 
          page: imageFile,
          error: error.message 
        });
      }
    }
    
    // Vérification du résultat
    if (!fullText.trim()) {
      throw formatError(ERROR_CODES.EMPTY_TEXT_RESULT, {
        pagesProcessed: imageFiles.length
      });
    }
    
    return fullText.trim();
    
  } catch (error) {
    // Propager les erreurs déjà formatées
    if (error.code && error.code.startsWith('OCR_')) {
      throw error;
    }
    
    // Erreur générique
    throw formatError(ERROR_CODES.UNKNOWN_ERROR, { originalError: error.message });
    
  } finally {
    // Nettoyage du dossier temporaire
    if (tempDir) {
      try {
        await fsExtra.remove(tempDir);
      } catch (cleanupError) {
        console.warn(`Échec du nettoyage du dossier temporaire (${tempDir}):`, cleanupError);
      }
    }
  }
}

/**
 * Extrait le texte d'un fichier image (jpg, png, tiff, etc) via Tesseract OCR
 * @param {string} imagePath - Chemin absolu vers le fichier image
 * @param {Object} options - Options d'extraction
 * @param {string} options.languages - Langues pour Tesseract (ex: 'fra+eng')
 * @param {Object} options.preprocess - Options de prétraitement d'image
 * @returns {Promise<string>} - Texte extrait de l'image
 * @throws {Error} - Erreur formatée en cas d'échec
 */
async function extractTextFromImage(imagePath, options = {}) {
  const { 
    languages = 'fra+eng',
    preprocess = {
      grayscale: true,
      normalize: true,
      sharpen: true
    }
  } = options;

  let tempImagePath = null;
  
  try {
    // Vérification de l'existence du fichier
    try {
      await fs.access(imagePath);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw formatError(ERROR_CODES.FILE_NOT_FOUND, { path: imagePath });
      } else if (error.code === 'EACCES') {
        throw formatError(ERROR_CODES.ACCESS_DENIED, { path: imagePath });
      }
      throw error;
    }
    
    // Configuration de Tesseract
    const tesseractConfig = {
      lang: languages,
      oem: 1,
      psm: 3,
    };
    
    // Prétraitement de l'image si demandé
    if (Object.values(preprocess).some(val => val)) {
      const tempDir = path.join(os.tmpdir(), `ocr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`);
      await fsExtra.ensureDir(tempDir);
      tempImagePath = path.join(tempDir, `processed_${path.basename(imagePath)}`);
      
      // Application des prétraitements
      const imageProcessor = sharp(imagePath);
      
      if (preprocess.grayscale) {
        imageProcessor.grayscale();
      }
      
      if (preprocess.normalize) {
        imageProcessor.normalize();
      }
      
      if (preprocess.sharpen) {
        imageProcessor.sharpen();
      }
      
      if (preprocess.resize) {
        imageProcessor.resize({
          width: preprocess.resize,
          withoutEnlargement: true
        });
      }
      
      await imageProcessor.toFile(tempImagePath);
      
      // Utilisation de l'image prétraitée pour l'OCR
      imagePath = tempImagePath;
    }
    
    // Exécution de l'OCR
    try {
      const text = await tesseract.recognize(imagePath, tesseractConfig);
      
      if (!text.trim()) {
        throw formatError(ERROR_CODES.EMPTY_TEXT_RESULT, { imagePath });
      }
      
      return text.trim();
      
    } catch (error) {
      if (error.code && error.code.startsWith('OCR_')) {
        throw error;
      }
      throw formatError(ERROR_CODES.TESSERACT_FAILED, { error: error.message });
    }
    
  } catch (error) {
    // Propager les erreurs déjà formatées
    if (error.code && error.code.startsWith('OCR_')) {
      throw error;
    }
    
    // Erreur générique
    throw formatError(ERROR_CODES.UNKNOWN_ERROR, { originalError: error.message });
    
  } finally {
    // Nettoyage du fichier temporaire
    if (tempImagePath) {
      try {
        await fsExtra.remove(path.dirname(tempImagePath));
      } catch (cleanupError) {
        console.warn(`Échec du nettoyage du fichier temporaire (${tempImagePath}):`, cleanupError);
      }
    }
  }
}

module.exports = {
  extractTextFromPdfViaOcr,
  extractTextFromImage
};
