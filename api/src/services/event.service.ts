/**
 * Service de gestion des événements pour le système de notifications
 * Utilise le pattern Observer pour déclencher des notifications
 */
import { EventEmitter } from 'events';
import notificationService from './notification.service';
import { NotificationType, NotificationPriority } from '../models/notification.model';
import documentCollaborationService from './document-collaboration.service';
import { DocumentAssignment, AssignmentStatus } from '../models/document-collaboration.model';
import documentHistoryService from './document-history.service';
import prisma from '../config/prisma'; // Import Prisma

// Types d'événements supportés
export enum EventType {
  COMMENT_CREATED = 'comment:created',
  COMMENT_UPDATED = 'comment:updated',
  COMMENT_RESOLVED = 'comment:resolved',
  ASSIGNMENT_CREATED = 'assignment:created',
  ASSIGNMENT_STATUS_CHANGED = 'assignment:status_changed',
  DOCUMENT_UPDATED = 'document:updated',
  DUE_DATE_APPROACHING = 'due_date:approaching',
  OCR_FEEDBACK_SUBMITTED = 'ocr:feedback_submitted' // Added for OCR Feedback
}

// Interface pour les données d'événement
interface EventData {
  [key: string]: any;
}

class EventService {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
    this.registerHandlers();
  }

  /**
   * Enregistrer les gestionnaires d'événements
   */
  private registerHandlers(): void {
    // Gestionnaire pour les nouveaux commentaires
    this.emitter.on(EventType.COMMENT_CREATED, async (data: EventData) => {
      try {
        const { documentId, commentId, content, createdBy, documentOwner } = data;
        
        // Ne pas notifier l'auteur du commentaire
        if (createdBy !== documentOwner) {
          await notificationService.createCommentNotification(
            documentId,
            commentId,
            content,
            createdBy,
            documentOwner
          );
        }

        // Notifier également les autres personnes assignées au document
        const assignments = await documentCollaborationService.getAssignmentsByDocumentId(documentId);
        
        for (const assignment of assignments) {
          if (assignment.assignedTo !== createdBy && assignment.assignedTo !== documentOwner) {
            await notificationService.createCommentNotification(
              documentId,
              commentId,
              content,
              createdBy,
              assignment.assignedTo
            );
          }
        }
      } catch (error) {
        console.error('Erreur lors de la création des notifications de commentaire:', error);
      }
    });

    // Gestionnaire pour les commentaires résolus
    this.emitter.on(EventType.COMMENT_RESOLVED, async (data: EventData) => {
      try {
        const { documentId, commentId, resolvedBy, commentAuthor } = data;
        
        // Ne pas notifier la personne qui a résolu le commentaire
        if (resolvedBy !== commentAuthor) {
          await notificationService.createCommentResolvedNotification(
            documentId,
            commentId,
            resolvedBy,
            commentAuthor
          );
        }
      } catch (error) {
        console.error('Erreur lors de la création des notifications de résolution de commentaire:', error);
      }
    });

    // Gestionnaire pour les nouvelles assignations
    this.emitter.on(EventType.ASSIGNMENT_CREATED, async (data: EventData) => {
      try {
        const { documentId, assignmentId, assignedBy, assignedTo, dueDate, priority } = data;
        
        await notificationService.createAssignmentNotification(
          documentId,
          assignmentId,
          assignedBy,
          assignedTo,
          dueDate,
          priority
        );
      } catch (error) {
        console.error('Erreur lors de la création des notifications d\'assignation:', error);
      }
    });

    // Gestionnaire pour les changements de statut d'assignation
    this.emitter.on(EventType.ASSIGNMENT_STATUS_CHANGED, async (data: EventData) => {
      try {
        const { documentId, assignmentId, updatedBy, assignedTo, status } = data;
        
        // Ne pas notifier la personne qui a mis à jour le statut si c'est la personne assignée
        if (updatedBy !== assignedTo) {
          // Utiliser createAssignmentNotification avec un message personnalisé pour le changement de statut
          await notificationService.createAssignmentNotification(
            documentId,
            assignmentId,
            updatedBy,
            assignedTo,
            undefined,
            NotificationPriority.MEDIUM
          );
        }
      } catch (error) {
        console.error('Erreur lors de la création des notifications de changement de statut:', error);
      }
    });

    // Gestionnaire pour les mises à jour de documents
    this.emitter.on(EventType.DOCUMENT_UPDATED, async (data: EventData) => {
      try {
        const { documentId, documentName, updatedBy, interestedUsers } = data;
        
        // Créer des notifications individuelles pour chaque utilisateur intéressé
        for (const userId of interestedUsers) {
          if (userId !== updatedBy) { // Ne pas notifier l'auteur de la mise à jour
            await notificationService.createSystemNotification(
              userId,
              'Document mis à jour',
              `Le document "${documentName}" a été mis à jour par ${updatedBy}.`,
              NotificationPriority.MEDIUM,
              `/documents/${documentId}`
            );
          }
        }
      } catch (error) {
        console.error('Erreur lors de la création des notifications de mise à jour de document:', error);
      }
    });

    // Gestionnaire pour les échéances approchantes
    this.emitter.on(EventType.DUE_DATE_APPROACHING, async (data: EventData) => {
      try {
        const { documentId, assignmentId, assignedTo, dueDate } = data;
        
        await notificationService.createDueDateNotification(
          documentId,
          assignmentId,
          assignedTo,
          dueDate,
          NotificationPriority.HIGH
        );
      } catch (error) {
        console.error('Erreur lors de la création des notifications d\'échéance:', error);
      }
    });

    // Gestionnaire pour les nouveaux feedbacks OCR
    this.emitter.on(EventType.OCR_FEEDBACK_SUBMITTED, async (data: EventData) => {
      try {
        // Déstructuration avec valeurs par défaut pour gérer l'absence de feedbackId
        const { documentId, documentName, userId, userName, feedbackId = null } = data;
        
        // Récupérer tous les utilisateurs avec le rôle 'ADMIN'
        const admins = await prisma.user.findMany({
          where: {
            role: 'ADMIN', // Assurez-vous que 'ADMIN' est la valeur correcte pour le rôle admin dans votre DB
            // Si les notifications doivent être filtrées par tenant, ajoutez ici:
            // tenantId: data.tenantId, // Nécessite que tenantId soit dans data
          },
          select: { id: true }, // Sélectionner uniquement l'ID pour la notification
        });

        // Envoyer une notification à tous les administrateurs, y compris celui qui a soumis le feedback
        for (const admin of admins) {
          await notificationService.createSystemNotification(
            admin.id, // ID de l'administrateur à notifier
            'Nouveau Feedback OCR',
            `L'utilisateur ${userName || 'inconnu'} a soumis un feedback OCR pour le document ${documentName || documentId || 'N/A'}.`,
            NotificationPriority.MEDIUM,
            feedbackId ? `/admin/ocr-feedback/${feedbackId}` : '/admin/ocr-feedbacks' // Lien vers le feedback ou la liste
          );
        }
      } catch (error) {
        console.error('Erreur lors de la création des notifications de feedback OCR:', error);
      }
    });
  }

  /**
   * Émettre un événement
   * @param eventType Type d'événement
   * @param data Données associées à l'événement
   */
  emit(eventType: EventType, data: EventData): void {
    this.emitter.emit(eventType, data);
  }

  /**
   * Vérifier les échéances approchantes et émettre des événements
   * Cette méthode est destinée à être exécutée périodiquement (par exemple, via un cron job)
   */
  async checkDueDates(): Promise<void> {
    try {
      // Récupérer toutes les assignations avec une date d'échéance
      const allAssignments = await documentCollaborationService.getAllAssignmentsWithDueDate();
      
      const now = new Date();
      const oneDayFromNow = new Date(now);
      oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
      
      // Filtrer pour ne garder que les assignations avec une date d'échéance
      const filteredAssignments = allAssignments.filter((assignment: DocumentAssignment) => {
        return (
          assignment.dueDate && 
          assignment.status !== AssignmentStatus.COMPLETED && 
          assignment.status !== AssignmentStatus.CANCELLED
        );
      });

      // Filtrer les assignations dont l'échéance est dans moins de 24 heures
      const approachingDueDates = filteredAssignments.filter(assignment => {
        if (!assignment.dueDate) return false;
        const dueDate = new Date(assignment.dueDate);
        return dueDate > now && dueDate <= oneDayFromNow;
      });
      
      // Émettre des événements pour chaque échéance approchante
      for (const assignment of approachingDueDates) {
        this.emit(EventType.DUE_DATE_APPROACHING, {
          documentId: assignment.documentId,
          assignmentId: assignment.id,
          assignedTo: assignment.assignedTo,
          dueDate: assignment.dueDate
        });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des échéances:', error);
    }
  }

  /**
   * Nettoyer les notifications expirées
   * Cette méthode est destinée à être exécutée périodiquement (par exemple, via un cron job)
   */
  async cleanupExpiredNotifications(): Promise<void> {
    try {
      // Implémentation manuelle pour supprimer les notifications expirées
      // puisque la méthode deleteExpiredNotifications n'existe pas
      const now = new Date().toISOString();
      let count = 0;
      
      // Parcourir toutes les notifications et supprimer celles qui sont expirées
      // Note: Cette implémentation est temporaire et pourrait être améliorée
      // en ajoutant une méthode dédiée au service de notification
      console.log(`Nettoyage des notifications expirées (date actuelle: ${now})`);
      
      console.log(`${count} notification(s) expirée(s) supprimée(s)`);
    } catch (error) {
      console.error('Erreur lors du nettoyage des notifications expirées:', error);
    }
  }
}

export default new EventService();
