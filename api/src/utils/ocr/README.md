# Module OCR Hybride pour ComptaDZ

Module d'extraction de texte robuste pour les factures et documents, combinant l'extraction directe de texte et l'OCR sur images.

## Fonctionnalités principales

- **Extraction directe de PDF natifs** via `pdf-parse`
- **Extraction OCR de PDF scannés** via `pdftoppm` (Poppler) + Tesseract
- **Extraction OCR d'images** (JPG, PNG, TIFF, etc.) via Tesseract
- **Fallback automatique** si l'extraction directe échoue
- **Prétraitement d'images** avec `sharp` pour améliorer la qualité OCR
- **Gestion d'erreurs complète** avec codes et messages utilisateur

## Prérequis

- **Node.js** ≥ 14
- **poppler-utils** (`pdftoppm`) installé et accessible dans le PATH
- **tesseract-ocr** installé avec les langues souhaitées (ex : `fra`, `eng`, `ara`)

### Installation des dépendances système

#### Windows (avec Chocolatey)
```powershell
# Installer Poppler
choco install poppler -y

# Installer Tesseract avec langues
choco install tesseract --params "/Langs:fra+eng+ara" -y
```

#### Linux (Debian/Ubuntu)
```bash
# Installer Poppler
sudo apt-get install -y poppler-utils

# Installer Tesseract avec langues
sudo apt-get install -y tesseract-ocr tesseract-ocr-fra tesseract-ocr-eng tesseract-ocr-ara
```

## Dépendances Node.js

Le module utilise les packages suivants :
- `pdf-parse` - Extraction de texte des PDF natifs
- `node-tesseract-ocr` - Interface Node.js pour Tesseract OCR
- `sharp` - Prétraitement des images
- `fs-extra` - Gestion des fichiers et dossiers temporaires

## Utilisation

### Fonction principale

```javascript
const { extractTextFromInvoice } = require('./utils/ocr');

async function processInvoice(filePath) {
  try {
    const text = await extractTextFromInvoice(filePath, {
      languages: 'fra+eng', 
      minTextLength: 50,
      dpi: 300,
      preprocess: {
        grayscale: true,
        normalize: true,
        sharpen: true
      }
    });
    
    console.log('Texte extrait:', text);
    return text;
  } catch (error) {
    console.error(`Erreur OCR: [${error.code}] ${error.message}`);
    // Gérer l'erreur selon son code
    if (error.code === 'OCR_CORRUPTED_PDF') {
      // Traitement spécifique pour PDF corrompu
    }
    throw error;
  }
}
```

### Options disponibles

```javascript
const options = {
  // Langues pour Tesseract (séparées par +)
  languages: 'fra+eng+ara',
  
  // Longueur minimale de texte pour l'extraction directe
  minTextLength: 30,
  
  // Résolution DPI pour pdftoppm
  dpi: 300,
  
  // Options de prétraitement d'image avec sharp
  preprocess: {
    grayscale: true,     // Conversion en niveaux de gris
    normalize: true,     // Normalisation du contraste
    sharpen: true,       // Amélioration de la netteté
    resize: 2000         // Redimensionnement (largeur en pixels)
  }
};
```

## Gestion des erreurs

Le module utilise un système de codes d'erreur standardisés pour faciliter la gestion côté client :

| Code | Description |
|------|-------------|
| `OCR_FILE_NOT_FOUND` | Fichier introuvable |
| `OCR_ACCESS_DENIED` | Accès au fichier refusé |
| `OCR_INVALID_FILE_FORMAT` | Format de fichier non pris en charge |
| `OCR_CORRUPTED_PDF` | PDF corrompu ou mal formaté |
| `OCR_PDF_EXTRACTION_FAILED` | Échec de l'extraction directe |
| `OCR_PDFTOPPM_FAILED` | Échec de la conversion PDF en images |
| `OCR_TESSERACT_FAILED` | Échec du traitement OCR |
| `OCR_TEMP_DIR_CREATION_FAILED` | Impossible de créer un dossier temporaire |
| `OCR_EMPTY_TEXT_RESULT` | Aucun texte extrait |
| `OCR_UNKNOWN_ERROR` | Erreur inconnue |

## Fonctions spécialisées

Le module exporte également des fonctions spécialisées pour des cas d'usage particuliers :

```javascript
const { 
  extractTextFromPdf,          // Extraction directe de PDF natifs
  extractTextFromPdfViaOcr,    // Conversion PDF en images puis OCR
  extractTextFromImage         // OCR sur images
} = require('./utils/ocr');
```

## Exemple complet

Voir le fichier `example.js` pour un exemple d'utilisation complet avec différents types de documents.

## Performance et considérations

- L'extraction directe est plus rapide mais moins robuste pour les PDF scannés ou mal formatés
- L'extraction via OCR est plus lente mais fonctionne sur tous types de documents
- Le prétraitement des images améliore considérablement la qualité OCR mais augmente le temps de traitement
- Les fichiers temporaires sont automatiquement nettoyés, même en cas d'erreur

## Dépannage

1. **Erreur "pdftoppm not found"** : Vérifiez que Poppler est correctement installé et que son dossier bin est dans le PATH
2. **Erreur "tesseract not found"** : Vérifiez l'installation de Tesseract et son accessibilité dans le PATH
3. **Erreur "language not found"** : Installez les packs de langue nécessaires pour Tesseract

## Évolutions futures

- Support des documents multi-pages optimisé (traitement parallèle)
- Détection automatique de la langue
- Amélioration de l'extraction de données structurées (tables, factures)
- Interface utilisateur pour ajuster les paramètres OCR
