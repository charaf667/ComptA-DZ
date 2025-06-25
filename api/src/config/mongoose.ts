import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

// URI de connexion MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/comptadz';

// Options de connexion
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout après 5 secondes au lieu de 30s par défaut
  autoIndex: true,
};

// Connexion à MongoDB - avec gestion de l'absence de MongoDB
const connectDB = async () => {
  // Vérifier si la connexion MongoDB est requise
  const useMongoose = process.env.USE_MONGOOSE === 'true';
  
  if (!useMongoose) {
    console.log('MongoDB désactivé. Utilisation de Prisma uniquement.');
    return;
  }
  
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connexion MongoDB établie avec succès');
  } catch (error) {
    console.error('Erreur de connexion à MongoDB:', error);
    console.log('Application continue sans MongoDB - utilisation de Prisma uniquement');
    // Ne pas quitter l'application en cas d'échec de connexion à MongoDB
  }
};

// Événements de connexion
mongoose.connection.on('connected', () => {
  console.log('Mongoose connecté à MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error(`Erreur de connexion Mongoose: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose déconnecté de MongoDB');
});

// Fermeture propre lors de l'arrêt de l'application
process.on('SIGINT', async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('Connexion Mongoose fermée suite à l\'arrêt de l\'application');
  }
  process.exit(0);
});

export default connectDB;
