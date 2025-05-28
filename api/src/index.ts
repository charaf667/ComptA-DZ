import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './config/prisma';

// Import des routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import tenantRoutes from './routes/tenantRoutes';
import ocrRoutes from './routes/ocr.routes';
import documentHistoryRoutes from './routes/document-history.routes';
import accountingEntriesRoutes from './routes/accounting-entries.routes';

// Initialisation des variables d'environnement
dotenv.config();

// Initialisation d'Express
const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares globaux
app.use(cors());
app.use(express.json());

// Routes publiques
app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'API ComptaDZ - SaaS de comptabilité pour PME algériennes' });
});

// Route de test pour vérifier la connexion à la base de données
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    console.error('Erreur de connexion à la base de données:', error);
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

// Configuration des routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tenants', tenantRoutes);
app.use('/api/ocr', ocrRoutes);
app.use('/api/document-history', documentHistoryRoutes);
app.use('/api/accounting-entries', accountingEntriesRoutes);

// Middleware de gestion des erreurs 404
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Serveur ComptaDZ démarré sur le port ${PORT}`);
  console.log(`API disponible sur http://localhost:${PORT}`);
});

// Gestion de la fermeture propre
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Connexion à la base de données fermée');
  process.exit(0);
});
