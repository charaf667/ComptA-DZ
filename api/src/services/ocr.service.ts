import * as fs from 'fs-extra';
import { AccountSuggestion } from './ai-classification.service';
import * as path from 'path';
import sharp from 'sharp';
// Importer notre nouveau module OCR hybride
// @ts-ignore: Fichier de déclaration manquant pour le module OCR
import { extractTextFromInvoice, extractTextFromPdf, extractTextFromImage, ERROR_CODES } from '../utils/ocr/index';

export interface ExtractedData {
  date?: string;
  montant?: number;
  tva?: number;
  libelle?: string;
  fournisseur?: string;
  reference?: string;
  dateEcheance?: string;  // Date d'échéance de paiement
  conditionsPaiement?: string; // Conditions de paiement (ex: 30 jours)
  devise?: string; // Devise (DZD, EUR, USD)
  numeroFacture?: string; // Numéro de facture
  adresseFournisseur?: string; // Adresse complète du fournisseur
  emailFournisseur?: string; // Email du fournisseur
  telephoneFournisseur?: string; // Téléphone du fournisseur
  nifFournisseur?: string; // Numéro d'identification fiscale
  articleFacture?: Array<{ // Détail des articles facturés
    designation: string;
    quantite?: number;
    prixUnitaire?: number;
    montantHT?: number;
  }>;
  confidence: number;
  initialAISuggestion?: AccountSuggestion; // Suggestion initiale faite par l'IA
}

export class OcrService {
  private readonly uploadDir: string;
  private readonly tempDir: string;
  private readonly langOptions: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'uploads');
    this.tempDir = path.join(process.cwd(), 'temp');
    this.langOptions = process.env.TESSERACT_LANG || 'ara+fra+eng';
    fs.ensureDirSync(this.uploadDir);
    fs.ensureDirSync(this.tempDir);
  }

  private async preprocessImage(imagePath: string): Promise<string> {
    const outputPath = path.join(this.tempDir, `preprocessed_${path.basename(imagePath)}`);
    await sharp(imagePath)
      .greyscale()
      .normalise() // Correction de normalize() à normalise()
      .sharpen()
      .threshold(128)
      .toFile(outputPath);
    return outputPath;
  }

  /**
   * Valide un fichier PDF pour s'assurer qu'il n'est pas corrompu
   * Cette méthode utilise notre nouveau module OCR hybride pour une meilleure tolérance aux erreurs
   * @param filePath Chemin du fichier PDF à valider
   * @param isChatGptPdf Indique si le PDF a été généré par ChatGPT
   */
  public async validatePdf(filePath: string, isChatGptPdf: boolean = false): Promise<boolean> {
    try {
      // Pour les PDF générés par ChatGPT ou les autres, nous utilisons une approche unifiée
      // qui est plus tolérante aux erreurs
      console.log(`Validation du PDF: ${filePath}${isChatGptPdf ? ' (ChatGPT)' : ''}`);
      
      // Vérifier l'existence du fichier
      await fs.access(filePath);
      
      // Vérifier que le fichier n'est pas vide
      const stats = await fs.stat(filePath);
      if (stats.size === 0) {
        throw new Error('Le fichier PDF est vide');
      }
      
      // Notre validation robuste : essayer d'extraire du texte avec notre nouveau module
      try {
        // Essayer d'extraire au moins un peu de texte
        // Cela détectera automatiquement les PDF corrompus
        await extractTextFromPdf(filePath, { minTextLength: 1 });
        console.log('PDF validé avec succès par extraction directe');
        return true;
      } catch (extractError: any) {
        // Si l'erreur est liée à un PDF corrompu mais qu'il semble contenir du contenu
        if (extractError.code === ERROR_CODES.CORRUPTED_PDF || 
            extractError.code === ERROR_CODES.PDF_EXTRACTION_FAILED) {
          
          // On peut quand même tenter l'OCR pour les PDF scannés ou corrompus
          console.log('PDF potentiellement scanné ou légèrement corrompu, considéré comme valide pour OCR');
          return true;
        }
        
        // Propager les erreurs liées à l'absence du fichier ou à un format invalide
        if (extractError.code === ERROR_CODES.FILE_NOT_FOUND || 
            extractError.code === ERROR_CODES.INVALID_FILE_FORMAT) {
          throw extractError;
        }
        
        // Pour les autres erreurs, on vérifie manuellement le header PDF
        const dataBuffer = await fs.readFile(filePath);
        if (dataBuffer.toString().includes('%PDF-')) {
          console.log('En-tête PDF détecté, considéré comme valide malgré les erreurs');
          return true;
        }
        
        // Si aucune méthode ne fonctionne, propager l'erreur
        throw extractError;
      }
    } catch (error: any) {
      // Formatter l'erreur pour l'API
      const errorMessage = error.code ? `${error.message} (${error.code})` : error.message;
      console.error('Erreur lors de la validation du PDF:', errorMessage);
      throw new Error(`PDF invalide: ${errorMessage}`);
    }
  }

  private async extractTextFromPdf(filePath: string): Promise<string> {
    try {
      // Utiliser l'extracteur de texte du nouveau module OCR
      console.log(`Tentative d'extraction de texte depuis le PDF: ${filePath}`);
      return await extractTextFromPdf(filePath, { minTextLength: 30 });
    } catch (error: any) {
      // Si le fichier est corrompu ou que l'extraction directe échoue, utiliser la méthode OCR
      if (error.code && [
        ERROR_CODES.CORRUPTED_PDF,
        ERROR_CODES.PDF_EXTRACTION_FAILED,
        ERROR_CODES.EMPTY_TEXT_RESULT
      ].includes(error.code)) {
        console.log(`Échec de l'extraction directe du PDF, basculement vers OCR: ${error.message}`);
        // Utiliser la méthode OCR du nouveau module
        return await extractTextFromInvoice(filePath, {
          languages: this.langOptions,
          dpi: 300,
          preprocess: {
            grayscale: true,
            normalize: true,
            sharpen: true
          }
        });
      }
      // Propager les autres erreurs
      throw error;
    }
  }

  private async extractTextFromImage(imagePath: string): Promise<string> {
    console.log(`Traitement OCR de l'image: ${imagePath}`);
    // Utiliser l'extracteur d'image du nouveau module OCR
    return await extractTextFromImage(imagePath, {
      languages: this.langOptions,
      preprocess: {
        grayscale: true,
        normalize: true,
        sharpen: true
      }
    });
  }

  /**
   * Analyse le texte extrait pour identifier les données structurées
   * @param text Texte extrait du document
   * @returns Données structurées extraites
   */
  private parseText(text: string): ExtractedData {
    // Expressions régulières pour les champs de base
    const dateRegex = /(\d{2}[\/\.-]\d{2}[\/\.-]\d{4}|\d{4}[\/\.-]\d{2}[\/\.-]\d{2})/g;
    const montantRegex = /(?:montant|total|somme|net \u00e0 payer).*?(\d+[.,]\d{2}|\d+)\s*(?:DZD|DA|EUR|\$|USD)?/i;
    const tvaRegex = /(?:tva|taxe).*?(\d+[.,]\d{2}|\d+)\s*(?:%|DZD|DA|EUR|\$|USD)?/i;
    const libelleRegex = /(?:objet|libellé|désignation|description).*?:?\s*([^\n]+)/i;
    const fournisseurRegex = /(?:fournisseur|émetteur|société|vendeur).*?:?\s*([^\n]+)/i;
    const referenceRegex = /(?:référence|ref|n°\s*(?:facture)?).*?:?\s*([^\n.]+)/i;
    
    // Expressions régulières pour les champs avancés
    const dateEcheanceRegex = /(?:échéance|date limite|paiement avant le|due date).*?(\d{2}[\/\.-]\d{2}[\/\.-]\d{4}|\d{4}[\/\.-]\d{2}[\/\.-]\d{2})/i;
    const conditionsPaiementRegex = /(?:conditions|modalités|termes)\s*(?:de)?\s*paiement.*?:?\s*([^\n]+)/i;
    const deviseRegex = /(?:devise|monnaie|currency).*?:?\s*([^\n]+)|(?:DZD|DA|EUR|\$|USD|Euros?|Dollars?)/i;
    const numeroFactureRegex = /(?:facture|invoice)\s*(?:n°|numéro)?\s*:?\s*([^\n]+)/i;
    const adresseRegex = /(?:adresse|siège|domicile).*?:?\s*([^\n]+(?:\n[^\n]+){0,3})/i;
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i;
    const telephoneRegex = /(?:téléphone|tel|phone|mobile).*?:?\s*([+\d\s.-]{8,})/i;
    const nifRegex = /(?:nif|n° fiscal|identifiant fiscal).*?:?\s*([^\n]+)/i;
    
    // Recherche des correspondances
    const dateMatch = text.match(dateRegex);
    const montantMatch = text.match(montantRegex);
    const tvaMatch = text.match(tvaRegex);
    const libelleMatch = text.match(libelleRegex);
    const fournisseurMatch = text.match(fournisseurRegex);
    const referenceMatch = text.match(referenceRegex);
    
    // Recherche des correspondances avancées
    const dateEcheanceMatch = text.match(dateEcheanceRegex);
    const conditionsPaiementMatch = text.match(conditionsPaiementRegex);
    const deviseMatch = text.match(deviseRegex);
    const numeroFactureMatch = text.match(numeroFactureRegex);
    const adresseMatch = text.match(adresseRegex);
    const emailMatch = text.match(emailRegex);
    const telephoneMatch = text.match(telephoneRegex);
    const nifMatch = text.match(nifRegex);
    
    // Extraction des articles facturés
    const articleFacture = this.extractArticles(text);
    
    // Calcul du score de confiance
    const totalElementsBase = 6; // Champs de base
    const totalElementsAvances = 8; // Champs avancés
    let foundElementsBase = 0;
    let foundElementsAvances = 0;
    
    // Compter les éléments de base trouvés
    if (dateMatch) foundElementsBase++;
    if (montantMatch) foundElementsBase++;
    if (tvaMatch) foundElementsBase++;
    if (libelleMatch) foundElementsBase++;
    if (fournisseurMatch) foundElementsBase++;
    if (referenceMatch) foundElementsBase++;
    
    // Compter les éléments avancés trouvés
    if (dateEcheanceMatch) foundElementsAvances++;
    if (conditionsPaiementMatch) foundElementsAvances++;
    if (deviseMatch) foundElementsAvances++;
    if (numeroFactureMatch) foundElementsAvances++;
    if (adresseMatch) foundElementsAvances++;
    if (emailMatch) foundElementsAvances++;
    if (telephoneMatch) foundElementsAvances++;
    if (nifMatch) foundElementsAvances++;
    
    // Calcul pondéré de la confiance (les champs de base sont plus importants)
    const confidenceBase = foundElementsBase / totalElementsBase;
    const confidenceAvancee = foundElementsAvances / totalElementsAvances;
    const confidence = (confidenceBase * 0.7) + (confidenceAvancee * 0.3);
    
    // Normalisation de la devise
    let devise: string | undefined;
    if (deviseMatch) {
      const deviseText = deviseMatch[1] || deviseMatch[0];
      if (/DZD|DA|dinar/i.test(deviseText)) {
        devise = 'DZD';
      } else if (/EUR|euro/i.test(deviseText)) {
        devise = 'EUR';
      } else if (/USD|\$|dollar/i.test(deviseText)) {
        devise = 'USD';
      } else {
        devise = deviseText.trim();
      }
    }
    
    // Construction et retour des données extraites
    return {
      // Champs de base
      date: dateMatch ? dateMatch[0] : undefined,
      montant: montantMatch ? parseFloat(montantMatch[1].replace(',', '.')) : undefined,
      tva: tvaMatch ? parseFloat(tvaMatch[1].replace(',', '.')) : undefined,
      libelle: libelleMatch ? libelleMatch[1].trim() : undefined,
      fournisseur: fournisseurMatch ? fournisseurMatch[1].trim() : undefined,
      reference: referenceMatch ? referenceMatch[1].trim() : undefined,
      
      // Champs avancés
      dateEcheance: dateEcheanceMatch ? dateEcheanceMatch[1] : undefined,
      conditionsPaiement: conditionsPaiementMatch ? conditionsPaiementMatch[1].trim() : undefined,
      devise,
      numeroFacture: numeroFactureMatch ? numeroFactureMatch[1].trim() : undefined,
      adresseFournisseur: adresseMatch ? adresseMatch[1].trim().replace(/\s+/g, ' ') : undefined,
      emailFournisseur: emailMatch ? emailMatch[0] : undefined,
      telephoneFournisseur: telephoneMatch ? telephoneMatch[1].trim() : undefined,
      nifFournisseur: nifMatch ? nifMatch[1].trim() : undefined,
      articleFacture: articleFacture.length > 0 ? articleFacture : undefined,
      
      confidence
    };
  }
  
  /**
   * Extrait les articles facturés du texte
   * @param text Texte du document
   * @returns Liste des articles facturés
   */
  private extractArticles(text: string): Array<{
    designation: string;
    quantite?: number;
    prixUnitaire?: number;
    montantHT?: number;
  }> {
    const articles: Array<{
      designation: string;
      quantite?: number;
      prixUnitaire?: number;
      montantHT?: number;
    }> = [];
    
    // Recherche des sections contenant des articles
    const articleSections = text.match(/(?:article|produit|prestation|service|désignation)[\s\S]*?(?:total|montant|somme)/gi);
    
    if (!articleSections) return articles;
    
    for (const section of articleSections) {
      // Diviser en lignes et traiter chaque ligne comme un article potentiel
      const lines = section.split('\n').filter(line => 
        line.trim().length > 0 && 
        /\d/.test(line) && // Au moins un chiffre dans la ligne
        !/total|somme|montant ht|tva/i.test(line) // Pas une ligne de total
      );
      
      for (const line of lines) {
        // Essayer d'extraire les informations de l'article
        const quantiteMatch = line.match(/(\d+)\s*(?:unité|u|pc|pièce)/i);
        const prixMatch = line.match(/(?:prix|p\.u\.?|unitaire)\s*:?\s*(\d+[.,]\d+|\d+)/i);
        const montantMatch = line.match(/(?:montant|prix|total)\s*:?\s*(\d+[.,]\d+|\d+)/i);
        
        // Essayer d'extraire la désignation (tout ce qui n'est pas un nombre ou un mot-clé)
        let designation = line.replace(/\d+[.,]\d+|\d+|quantité|prix|unité|montant|total|ht|ttc/gi, '').trim();
        
        // Si la désignation est trop courte, utiliser toute la ligne
        if (designation.length < 3) {
          designation = line.trim();
        }
        
        if (designation) {
          articles.push({
            designation,
            quantite: quantiteMatch ? parseInt(quantiteMatch[1]) : undefined,
            prixUnitaire: prixMatch ? parseFloat(prixMatch[1].replace(',', '.')) : undefined,
            montantHT: montantMatch ? parseFloat(montantMatch[1].replace(',', '.')) : undefined
          });
        }
      }
    }
    
    return articles;
  }

  /**
   * Extrait les données d'un fichier (PDF ou image) avec notre approche hybride robuste
   * @param filePath Chemin du fichier à traiter
   * @returns Données structurées extraites du document
   */
  public async extractDataFromFile(filePath: string): Promise<ExtractedData> {
    const fileExt = path.extname(filePath).toLowerCase();
    let text = '';
    
    try {
      // Utiliser directement la fonction principale de notre module OCR hybride
      // Elle gère automatiquement les différents formats et implémente le fallback
      console.log(`Extraction de données depuis: ${filePath} (${fileExt})`);
      text = await extractTextFromInvoice(filePath, {
        languages: this.langOptions,
        minTextLength: 30,
        dpi: 300,
        preprocess: {
          grayscale: true,
          normalize: true,
          sharpen: true
        }
      });
      
      console.log(`Extraction réussie: ${text.length} caractères`);
      
      // Si le texte est trop court, lancer une erreur
      if (text.length < 10) {
        throw new Error('Texte extrait trop court ou vide');
      }
      
      // Analyser le texte pour extraire les données structurées
      return this.parseText(text);
      
    } catch (error: any) {
      // Log détaillé pour faciliter le débogage
      console.error(`Erreur lors de l'extraction depuis ${fileExt}:`, error);
      
      // Propager l'erreur avec un message plus convivial
      if (error.code && error.code.startsWith('OCR_')) {
        throw new Error(`Erreur d'extraction: ${error.message}`);
      } else {
        throw new Error(`Format de fichier non supporté ou extraction impossible: ${fileExt}`);
      }
    }
  }

  /**
   * Sauvegarde les données extraites modifiées
   * Cette méthode peut être utilisée pour enregistrer les corrections manuelles
   * et améliorer les futures extractions
   * @param editedData Données extraites modifiées
   * @param documentId Identifiant du document (optionnel)
   * @returns Les données sauvegardées avec un indicateur de succès
   */
  public async saveEditedData(editedData: ExtractedData, documentId?: string): Promise<{ success: boolean; data: ExtractedData }> {
    try {
      // Validation des données
      if (!editedData) {
        throw new Error('Aucune donnée fournie');
      }

      // Mise à jour de la confiance
      // Les données modifiées manuellement ont une confiance de 1.0 (100%)
      editedData.confidence = 1.0;
      
      // Ajouter un horodatage de modification
      const timestamp = new Date().toISOString();
      const enhancedData = {
        ...editedData,
        lastModified: timestamp,
        isManuallyEdited: true
      };
      
      // TODO: Dans une implémentation réelle, nous sauvegarderions ces données dans une base de données
      // et utiliserions ces corrections pour améliorer l'algorithme d'extraction
      
      // Simuler un délai de sauvegarde
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        success: true,
        data: enhancedData
      };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des données modifiées:', error);
      throw error;
    }
  }
}

export default new OcrService();
