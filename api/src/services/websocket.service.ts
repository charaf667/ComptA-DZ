/**
 * Service WebSocket pour les communications en temps réel
 */
import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../middlewares/authMiddleware';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  tenantId?: string;
}

class WebSocketService {
  private io: Server | null = null;
  private connectedUsers: Map<string, AuthenticatedSocket[]> = new Map();

  /**
   * Initialiser le serveur WebSocket
   * @param server Serveur HTTP Express
   */
  initialize(server: HttpServer): void {
    this.io = new Server(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? process.env.FRONTEND_URL || 'https://comptadz.com' 
          : ['http://localhost:3000', 'http://localhost:5173'],
        methods: ['GET', 'POST'],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();

    console.log('Service WebSocket initialisé');
  }

  /**
   * Middleware d'authentification pour WebSocket
   */
  private setupMiddleware(): void {
    if (!this.io) return;

    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        // Récupérer le token du header d'autorisation
        const token = socket.handshake.auth.token;
        console.log('WebSocket - Auth Token reçu:', token ? 'Présent' : 'Absent');

        if (!token) {
          console.log('WebSocket - Connexion refusée: Token absent');
          return next(new Error('Authentification requise'));
        }

        try {
          // Vérifier et décoder le token JWT
          const decoded = verifyToken(token);
          console.log('WebSocket - Décodage token:', decoded ? 'Succès' : 'Échec', decoded);
          
          // Si l'utilisateur est défini directement dans decoded
          if (decoded && decoded.id) {
            socket.userId = decoded.id;
            socket.tenantId = decoded.tenantId;
            console.log(`WebSocket - Utilisateur authentifié: ${decoded.id}`);
            return next();
          }
          
          // Si l'utilisateur est dans une propriété 'user' (structure alternative)
          if (decoded && decoded.user && decoded.user.id) {
            socket.userId = decoded.user.id;
            socket.tenantId = decoded.tenant;
            console.log(`WebSocket - Utilisateur authentifié (format alt.): ${decoded.user.id}`);
            return next();
          }

          console.log('WebSocket - Token invalide - Structure incorrecte:', decoded);
          return next(new Error('Token invalide - structure incorrecte'));
        } catch (error) {
          console.error('WebSocket - Erreur de validation token:', error);
          next(new Error('Token invalide - erreur de validation'));
        }
      } catch (error) {
        console.error('Erreur WebSocket middleware:', error);
        next(new Error('Erreur interne du serveur'));
      }
    });
  }

  /**
   * Configurer les gestionnaires d'événements WebSocket
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      if (!socket.userId) {
        socket.disconnect();
        return;
      }

      console.log(`Utilisateur connecté: ${socket.userId}`);
      
      // Stocker le socket de l'utilisateur
      this.addUserSocket(socket.userId, socket);

      // Rejoindre la salle spécifique au tenant pour les notifications multi-tenant
      if (socket.tenantId) {
        socket.join(`tenant:${socket.tenantId}`);
      }

      // Événement de déconnexion
      socket.on('disconnect', () => {
        console.log(`Utilisateur déconnecté: ${socket.userId}`);
        this.removeUserSocket(socket.userId!, socket);
      });
    });
  }

  /**
   * Ajouter un socket à un utilisateur
   */
  private addUserSocket(userId: string, socket: AuthenticatedSocket): void {
    if (!this.connectedUsers.has(userId)) {
      this.connectedUsers.set(userId, []);
    }
    this.connectedUsers.get(userId)!.push(socket);
  }

  /**
   * Supprimer un socket d'un utilisateur
   */
  private removeUserSocket(userId: string, socket: AuthenticatedSocket): void {
    if (!this.connectedUsers.has(userId)) return;

    const userSockets = this.connectedUsers.get(userId)!;
    const index = userSockets.findIndex(s => s.id === socket.id);
    
    if (index !== -1) {
      userSockets.splice(index, 1);
    }

    // Si l'utilisateur n'a plus de sockets actifs, supprimer l'entrée
    if (userSockets.length === 0) {
      this.connectedUsers.delete(userId);
    }
  }

  /**
   * Envoyer une notification à un utilisateur spécifique
   */
  sendNotification(userId: string, notification: any): void {
    if (!this.io) return;

    // Utiliser le canal utilisateur si l'utilisateur est connecté
    if (this.connectedUsers.has(userId)) {
      const userSockets = this.connectedUsers.get(userId)!;
      for (const socket of userSockets) {
        socket.emit('notification', notification);
      }
    }
  }

  /**
   * Envoyer une notification à tous les utilisateurs d'un tenant
   */
  sendTenantNotification(tenantId: string, notification: any, excludeUserId?: string): void {
    if (!this.io) return;

    // Utiliser la salle tenant pour envoyer à tous les utilisateurs du tenant
    this.io.to(`tenant:${tenantId}`).emit('notification', {
      ...notification,
      excludeUserId // Le client peut filtrer si nécessaire
    });
  }

  /**
   * Envoyer une notification à un groupe d'utilisateurs
   */
  sendNotificationToUsers(userIds: string[], notification: any): void {
    for (const userId of userIds) {
      this.sendNotification(userId, notification);
    }
  }

  /**
   * Diffuser une notification à tous les utilisateurs (admin uniquement)
   */
  broadcastNotification(notification: any): void {
    if (!this.io) return;
    this.io.emit('notification', notification);
  }

  /**
   * Envoyer une mise à jour d'état à un utilisateur spécifique
   */
  sendStatusUpdate(userId: string, status: any): void {
    this.sendNotification(userId, { type: 'STATUS_UPDATE', data: status });
  }
}

// Exporter une instance du service
const webSocketService = new WebSocketService();
export default webSocketService;
