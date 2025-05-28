"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs-extra"));
const ocr_controller_1 = __importDefault(require("../controllers/ocr.controller"));
const router = express_1.default.Router();
// Configuration de Multer pour le stockage des fichiers
const storage = multer_1.default.diskStorage({
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
const fileFilter = (req, file, cb) => {
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
    }
    else {
        cb(new Error(`Type de fichier non supporté. Types acceptés: ${allowedFileTypes.join(', ')}`));
    }
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // limite à 10MB
    }
});
// Routes pour l'OCR et la classification
router.post('/extract', upload.single('file'), ocr_controller_1.default.processFile);
router.post('/classify', ocr_controller_1.default.classifyDocument);
router.post('/process', upload.single('file'), ocr_controller_1.default.processAndClassify);
router.post('/feedback', ocr_controller_1.default.recordFeedback);
router.post('/save-edited-data', ocr_controller_1.default.saveEditedData);
exports.default = router;
