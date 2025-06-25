import express, { Request, Response } from 'express';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs-extra';
import ocrController from '../controllers/ocr.controller';
import { default as authMiddleware, AuthRequest } from '../middlewares/authMiddleware';

const router = express.Router();

// Multer config for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    fs.ensureDirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
  }
});

// File filter to restrict accepted file types
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.tiff', '.bmp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedFileTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type. Accepted types: ${allowedFileTypes.join(', ')}`));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// OCR and classification routes
router.post('/extract', authMiddleware, upload.single('file'), ocrController.processFile);
router.post('/classify', authMiddleware, ocrController.classifyDocument);
router.post('/process', authMiddleware, upload.single('file'), ocrController.processAndClassify);
router.post('/feedback', authMiddleware, ocrController.recordFeedback);
router.post('/save-edited-data', authMiddleware, ocrController.saveEditedData);

// Route to get adaptive learning patterns (for admin/debug)
router.get('/learning-patterns', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const adaptiveLearningService = require('../services/adaptive-learning.service').default;

    const { accountCode, minConfidence, minOccurrences, limit } = req.query;
    const tenantId = req.tenant?.id;

    if (!tenantId) {
      res.status(403).json({ success: false, message: 'Access denied or tenant not identified.' });
      return;
    }

    const patterns = await adaptiveLearningService.getPatterns(tenantId, {
      accountCode: accountCode as string,
      minConfidence: minConfidence ? parseFloat(minConfidence as string) : undefined,
      minOccurrences: minOccurrences ? parseInt(minOccurrences as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined
    });

    res.status(200).json({
      success: true,
      count: patterns.length,
      data: patterns
    });
  } catch (error) {
    console.error('Error fetching learning patterns:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching learning patterns.',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
