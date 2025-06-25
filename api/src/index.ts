import express, { Request, Response } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import webSocketService from './services/websocket.service';
import prisma from './config/prisma';
import connectDB from './config/mongoose';

// Import des routes
import apiRoutes from './routes'; // Importe le routeur principal

// Initialisation des variables d'environnement
dotenv.config();

// Initialisation d'Express et du serveur HTTP
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

// Initialisation du service WebSocket avec le serveur HTTP
webSocketService.initialize(server);

// Connexion à MongoDB via Mongoose
connectDB();

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

// Configuration des routes de l'API
app.use('/api', apiRoutes);

// Middleware de gestion des erreurs 404
app.use((req: Request, res: Response) => {
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
  await prisma.$disconnect();
  console.log('Connexion à la base de données fermée');
  process.exit(0);
});
