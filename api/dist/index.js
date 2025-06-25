"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const websocket_service_1 = __importDefault(require("./services/websocket.service"));
const prisma_1 = __importDefault(require("./config/prisma"));
const mongoose_1 = __importDefault(require("./config/mongoose"));
// Import des routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const tenantRoutes_1 = __importDefault(require("./routes/tenantRoutes"));
const ocr_routes_1 = __importDefault(require("./routes/ocr.routes"));
const document_history_routes_1 = __importDefault(require("./routes/document-history.routes"));
const accounting_entries_routes_1 = __importDefault(require("./routes/accounting-entries.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const account_routes_1 = __importDefault(require("./routes/account.routes"));
const performanceRoutes_1 = __importDefault(require("./routes/performanceRoutes"));
// Initialisation des variables d'environnement
dotenv_1.default.config();
// Initialisation d'Express et du serveur HTTP
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const PORT = process.env.PORT || 4000;
// Initialisation du service WebSocket avec le serveur HTTP
websocket_service_1.default.initialize(server);
// Connexion à MongoDB via Mongoose
(0, mongoose_1.default)();
// Middlewares globaux
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes publiques
app.get('/', (req, res) => {
    res.json({ message: 'API ComptaDZ - SaaS de comptabilité pour PME algériennes' });
});
// Route de test pour vérifier la connexion à la base de données
app.get('/api/health', async (req, res) => {
    try {
        await prisma_1.default.$queryRaw `SELECT 1`;
        res.json({ status: 'ok', database: 'connected' });
    }
    catch (error) {
        console.error('Erreur de connexion à la base de données:', error);
        res.status(500).json({ status: 'error', database: 'disconnected' });
    }
});
// Configuration des routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/tenants', tenantRoutes_1.default);
app.use('/api/ocr', ocr_routes_1.default);
app.use('/api/performance-metrics', performanceRoutes_1.default);
app.use('/api/document-history', document_history_routes_1.default);
app.use('/api/accounting-entries', accounting_entries_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/accounts', account_routes_1.default);
// Middleware de gestion des erreurs 404
app.use((req, res) => {
    res.status(404).json({ message: 'Route non trouvée' });
});
// Démarrage du serveur HTTP avec support WebSocket
server.listen(PORT, () => {
    console.log(`Serveur ComptaDZ démarré sur le port ${PORT}`);
    console.log(`API disponible sur http://localhost:${PORT}`);
    console.log(`WebSocket disponible sur ws://localhost:${PORT}`);
});
// Gestion de la fermeture propre
process.on('SIGINT', async () => {
    await prisma_1.default.$disconnect();
    console.log('Connexion à la base de données fermée');
    process.exit(0);
});
