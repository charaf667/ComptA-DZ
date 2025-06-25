/**
 * Service pour gérer la connexion WebSocket avec le backend
 */
import { io, Socket } from 'socket.io-client';
import { getToken } from '../utils/auth';

// Implémentation simple d'un EventEmitter compatible navigateur
class EventEmitter {
  private events: Record<string, Array<(...args: any[]) => void>> = {};

  on(event: string, listener: (...args: any[]) => void): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  off(event: string, listener: (...args: any[]) => void): void {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }
}

// Type d'événements WebSocket sous forme d'objet constant
export const WebSocketEventType = {
  NOTIFICATION: 'notification',
  STATUS_UPDATE: 'status_update',
  CONNECTED: 'connected',
  DISCONNECTED: 'disconnected',
  ERROR: 'error'
} as const;

export type WebSocketEventType = typeof WebSocketEventType[keyof typeof WebSocketEventType];

class WebSocketService {
  private socket: Socket | null = null;
  private eventEmitter: EventEmitter = new EventEmitter();
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 3000; // 3 secondes
  private _isConnected: boolean = false;

  /**
   * Initialise la connexion WebSocket
   */
  connect(): void {
    if (this.socket) {
      return; // Déjà connecté
    }

    const token = getToken();
    if (!token) {
      console.error('WebSocket: Impossible de se connecter sans token');
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    
    this.socket = io(apiUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay
    });

    this._setupListeners();
  }

  /**
   * Met en place les écouteurs d'événements WebSocket
   */
  private _setupListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket: Connecté au serveur');
      this._isConnected = true;
      this.reconnectAttempts = 0;
      this.eventEmitter.emit(WebSocketEventType.CONNECTED);
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`WebSocket: Déconnecté du serveur (${reason})`);
      this._isConnected = false;
      this.eventEmitter.emit(WebSocketEventType.DISCONNECTED, reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket: Erreur de connexion', error);
      this.eventEmitter.emit(WebSocketEventType.ERROR, error);
      
      if (++this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.disconnect();
        console.error('WebSocket: Nombre maximal de tentatives de reconnexion atteint');
      }
    });

    // Événement de notification
    this.socket.on(WebSocketEventType.NOTIFICATION, (notification) => {
      console.log('WebSocket: Notification reçue', notification);
      this.eventEmitter.emit(WebSocketEventType.NOTIFICATION, notification);
    });

    // Événement de mise à jour de statut
    this.socket.on(WebSocketEventType.STATUS_UPDATE, (update) => {
      console.log('WebSocket: Mise à jour de statut reçue', update);
      this.eventEmitter.emit(WebSocketEventType.STATUS_UPDATE, update);
    });
  }

  /**
   * Déconnecte la connexion WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this._isConnected = false;
      console.log('WebSocket: Déconnecté manuellement');
    }
  }

  /**
   * Vérifie si la connexion WebSocket est active
   */
  isConnected(): boolean {
    return this._isConnected;
  }

  /**
   * S'abonne à un événement WebSocket
   * @param event Type d'événement
   * @param listener Fonction de rappel
   */
  on(event: WebSocketEventType, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Se désabonne d'un événement WebSocket
   * @param event Type d'événement
   * @param listener Fonction de rappel
   */
  off(event: WebSocketEventType, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }

  /**
   * Reconnecte au serveur WebSocket
   */
  reconnect(): void {
    if (this.socket) {
      this.disconnect();
    }
    this.reconnectAttempts = 0;
    this.connect();
  }
}

const websocketService = new WebSocketService();
export default websocketService;
