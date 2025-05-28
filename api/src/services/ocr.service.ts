import { createWorker } from 'tesseract.js';
import * as fs from 'fs-extra';
import * as path from 'path';
import sharp from 'sharp';
import pdf from 'pdf-parse';

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
   * Cette méthode tente de lire le PDF pour détecter les erreurs de structure
   * comme "bad XRef entry"
   * @param filePath Chemin du fichier PDF à valider
   * @param isChatGptPdf Indique si le PDF a été généré par ChatGPT
   */
  public async validatePdf(filePath: string, isChatGptPdf: boolean = false): Promise<boolean> {
    try {
      const dataBuffer = await fs.readFile(filePath);
      
      if (isChatGptPdf) {
        // Pour les PDF générés par ChatGPT, nous utilisons une approche différente
        // Au lieu de valider la structure complète, nous vérifions juste la présence de contenu
        if (dataBuffer.length > 0) {
          console.log('PDF généré par ChatGPT détecté, validation simplifiée appliquée');
          return true;
        } else {
          throw new Error('Le fichier PDF est vide');
        }
      } else {
        // Approche standard pour les autres PDF
        try {
          // Tenter de parser le PDF pour vérifier sa validité
          await pdf(dataBuffer);
          return true;
        } catch (pdfError: any) {
          // Si l'erreur est liée à XRef, essayer l'approche alternative
          if (pdfError.message && pdfError.message.includes('XRef')) {
            console.log('Erreur XRef détectée, tentative de validation alternative...');
            // Vérifier simplement que le fichier contient du contenu PDF
            if (dataBuffer.toString().includes('%PDF-')) {
              console.log('En-tête PDF détecté, considéré comme valide malgré l\'erreur XRef');
              return true;
            }
          }
          throw pdfError;
        }
      }
    } catch (error: any) {
      console.error('Erreur lors de la validation du PDF:', error.message);
      throw new Error(`PDF invalide: ${error.message}`);
    }
  }

  private async extractTextFromPdf(filePath: string): Promise<string> {
    const dataBuffer = await fs.readFile(filePath);
    const data = await pdf(dataBuffer);
    return data.text;
  }

  private async extractTextFromImage(imagePath: string): Promise<string> {
    const worker = await createWorker();
    await worker.loadLanguage(this.langOptions);
    await worker.initialize(this.langOptions);
    
    const preprocessedImagePath = await this.preprocessImage(imagePath);
    const { data: { text } } = await worker.recognize(preprocessedImagePath);
    await worker.terminate();
    await fs.remove(preprocessedImagePath);
    return text;
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

  public async extractDataFromFile(filePath: string): Promise<ExtractedData> {
    const fileExt = path.extname(filePath).toLowerCase();
    let text = '';
    if (fileExt === '.pdf') {
      text = await this.extractTextFromPdf(filePath);
    } else if (['.jpg', '.jpeg', '.png', '.tiff', '.bmp'].includes(fileExt)) {
      text = await this.extractTextFromImage(filePath);
    } else {
      throw new Error(`Format de fichier non supporté: ${fileExt}`);
    }
    return this.parseText(text);
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
