import express from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs-extra';
import ocrController from '../controllers/ocr.controller';

const router = express.Router();

// Configuration de Multer pour le stockage des fichiers
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique avec timestamp
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

// Filtre pour limiter les types de fichiers acceptés
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.bmp'];
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype.toLowerCase();
  
  // Vérification plus stricte pour les PDF
  if (ext === '.pdf' && mimeType !== 'application/pdf') {
    cb(new Error('Le fichier a une extension PDF mais un type MIME incorrect'));
    return;
  }
  
  if (allowedFileTypes.includes(ext)) {
    // Validation supplémentaire pour les types d'image
    if ((ext === '.jpg' || ext === '.jpeg') && !mimeType.includes('jpeg')) {
      cb(new Error('Le fichier a une extension JPG mais un type MIME incorrect'));
      return;
    }
    if (ext === '.png' && !mimeType.includes('png')) {
      cb(new Error('Le fichier a une extension PNG mais un type MIME incorrect'));
      return;
    }
    
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non supporté. Types acceptés: ${allowedFileTypes.join(', ')}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // limite à 10MB
  }
});

// Routes pour l'OCR et la classification
router.post('/extract', upload.single('file'), ocrController.processFile);
router.post('/classify', ocrController.classifyDocument);
router.post('/process', upload.single('file'), ocrController.processAndClassify);
router.post('/feedback', ocrController.recordFeedback);
router.post('/save-edited-data', ocrController.saveEditedData);

export default router;
