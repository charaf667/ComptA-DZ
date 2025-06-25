export interface ExtractedData {
  text: string;
  montantHT: number;
  montantTTC: number;
  dateFacture: string;
  fournisseur: string;
  libelle?: string;
  referenceFacture: string;
  tva: number;
  confidence: number;
}

export interface OcrResult {
  extractedData: ExtractedData;
  originalImage?: string;
  confidence: number;
}

export interface OcrRequest {
  file: Express.Multer.File;
  tenantId: string;
}

export interface FeedbackData {
  originalExtractedData: ExtractedData;
  correctedData: ExtractedData;
  selectedAccount?: string;
  accountCode?: string;
  accountName?: string;
  confidence?: number;
}
