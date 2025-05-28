"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authRoutes_1 = __importDefault(require("./authRoutes"));
const userRoutes_1 = __importDefault(require("./userRoutes"));
const tenantRoutes_1 = __importDefault(require("./tenantRoutes"));
const ocr_routes_1 = __importDefault(require("./ocr.routes"));
const document_history_routes_1 = __importDefault(require("./document-history.routes"));
const document_version_routes_1 = __importDefault(require("./document-version.routes"));
const router = express_1.default.Router();
// Routes de l'application
router.use('/auth', authRoutes_1.default);
router.use('/users', userRoutes_1.default);
router.use('/tenants', tenantRoutes_1.default);
router.use('/ocr', ocr_routes_1.default);
router.use('/document-history', document_history_routes_1.default);
router.use('/document-versions', document_version_routes_1.default);
exports.default = router;
