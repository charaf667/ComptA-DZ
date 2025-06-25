/**
 * Exemple d'utilisation du module OCR hybride
 * Ce fichier montre comment appeler le service OCR pour extraire du texte
 * à partir de différents types de documents (PDF natif, PDF scanné, image)
 */

const path = require('path');
const { extractTextFromInvoice } = require('./ocrService');

// Définition des chemins d'exemple
const SAMPLE_PDF_NATIVE = path.join(__dirname, '..', '..', '..', 'test-samples', 'facture-native.pdf');
const SAMPLE_PDF_SCANNED = path.join(__dirname, '..', '..', '..', 'test-samples', 'facture-scannee.pdf');
const SAMPLE_IMAGE = path.join(__dirname, '..', '..', '..', 'test-samples', 'facture-image.jpg');

/**
 * Exécute un test d'extraction sur un fichier spécifique
 * @param {string} filePath - Chemin du fichier à traiter
 * @param {Object} options - Options d'extraction OCR
 */
async function runExtraction(filePath, options = {}) {
  console.log(`\n==== TRAITEMENT DE: ${path.basename(filePath)} ====`);
  console.time('Temps d\'extraction');
  
  try {
    const text = await extractTextFromInvoice(filePath, options);
    console.log('\n✅ RÉSULTAT DE L\'EXTRACTION:');
    console.log('─'.repeat(50));
    
    // Affichage du début du texte pour démonstration
    const previewLength = 500;
    console.log(text.length > previewLength 
      ? text.substring(0, previewLength) + '...' 
      : text
    );
    console.log('─'.repeat(50));
    console.log(`Longueur totale: ${text.length} caractères`);
    
  } catch (error) {
    console.error('\n❌ ERREUR D\'EXTRACTION:');
    console.error(`Code: ${error.code}`);
    console.error(`Message: ${error.message}`);
    
    if (error.details) {
      console.error('Détails:', JSON.stringify(error.details, null, 2));
    }
  }
  
  console.timeEnd('Temps d\'extraction');
}

/**
 * Exécute les démonstrations d'extraction OCR
 */
async function runDemos() {
  // Configuration OCR
  const options = {
    languages: 'fra+eng+ara',
    minTextLength: 50,
    preprocess: {
      grayscale: true,
      normalize: true,
      sharpen: true
    }
  };

  try {
    // 1. Test sur un PDF natif (avec texte sélectionnable)
    await runExtraction(SAMPLE_PDF_NATIVE, options);
    
    // 2. Test sur un PDF scanné (image sans texte sélectionnable)
    await runExtraction(SAMPLE_PDF_SCANNED, options);
    
    // 3. Test sur une image directe
    await runExtraction(SAMPLE_IMAGE, options);
    
  } catch (error) {
    console.error('Erreur globale:', error);
  }
}

// Exécution de la démo si ce fichier est exécuté directement
if (require.main === module) {
  console.log('📄 DÉMONSTRATION DU MODULE OCR HYBRIDE');
  console.log('Prérequis: pdftoppm et tesseract doivent être installés et accessibles');
  
  runDemos().then(() => {
    console.log('\n✨ DÉMONSTRATION TERMINÉE');
  }).catch(err => {
    console.error('\n❌ ERREUR DANS LA DÉMONSTRATION:', err);
    process.exit(1);
  });
}
