import React, { useState, useEffect } from 'react';
import { FiUsers, FiUserCheck, FiAlertCircle, FiUserX, FiCalendar, FiInfo, FiEdit2, FiTrash2 } from 'react-icons/fi';
import documentCollaborationService from '../../../services/document-collaboration.service';
import { AssignmentStatus } from '../../../types/document-collaboration';
import type { DocumentAssignment } from '../../../types/document-collaboration';
import type { ProcessedDocument } from '../../../types/document-history';
import { useAuth } from '../../../contexts/auth/AuthContext';

interface DocumentAssignmentsProps {
  document: ProcessedDocument;
  className?: string;
}

const DocumentAssignments: React.FC<DocumentAssignmentsProps> = ({
  document,
  className = ''
}) => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<DocumentAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<DocumentAssignment | null>(null);
  
  // États pour le formulaire d'assignation
  const [assignTo, setAssignTo] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  
  // Charger les assignations lors du chargement du composant
  useEffect(() => {
    if (document.id) {
      loadAssignments();
    }
  }, [document.id]);
  
  // Charger les assignations du document
  const loadAssignments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await documentCollaborationService.getAssignments({
        documentId: document.id,
        sortDirection: 'desc'
      });
      
      setAssignments(result);
    } catch (error) {
      console.error('Erreur lors du chargement des assignations:', error);
      setError("Impossible de charger les assignations");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Réinitialiser le formulaire
  const resetForm = () => {
    setAssignTo('');
    setDueDate('');
    setDescription('');
    setPriority('medium');
    setSelectedAssignment(null);
    setShowAssignmentForm(false);
  };
  
  // Ouvrir le formulaire pour éditer une assignation
  const handleEditAssignment = (assignment: DocumentAssignment) => {
    setSelectedAssignment(assignment);
    setAssignTo(assignment.assignedTo);
    setDueDate(assignment.dueDate || '');
    setDescription(assignment.description || '');
    setPriority(assignment.priority || 'medium');
    setShowAssignmentForm(true);
  };
  
  // Soumettre le formulaire d'assignation
  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!assignTo.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      if (selectedAssignment) {
        // Mise à jour d'une assignation existante
        await documentCollaborationService.updateAssignment(selectedAssignment.id, {
          dueDate: dueDate || undefined,
          description: description.trim() || undefined,
          priority
        });
      } else {
        // Création d'une nouvelle assignation
        await documentCollaborationService.createAssignment({
          documentId: document.id,
          assignedTo: assignTo.trim(),
          assignedBy: user?.nom || 'Utilisateur anonyme',
          dueDate: dueDate || undefined,
          description: description.trim() || undefined,
          priority
        });
      }
      
      resetForm();
      loadAssignments();
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'assignation:', error);
      setError("Impossible d'enregistrer l'assignation");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Supprimer une assignation
  const handleDeleteAssignment = async (assignmentId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette assignation ?')) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      await documentCollaborationService.deleteAssignment(assignmentId);
      setAssignments(assignments.filter(a => a.id !== assignmentId));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'assignation:', error);
      setError("Impossible de supprimer l'assignation");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Mettre à jour le statut d'une assignation
  const handleUpdateStatus = async (assignmentId: string, status: AssignmentStatus) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedAssignment = await documentCollaborationService.updateAssignmentStatus(assignmentId, status);
      
      setAssignments(assignments.map(a => 
        a.id === assignmentId ? updatedAssignment : a
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      setError("Impossible de mettre à jour le statut");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Formater la date pour l'affichage
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  // Obtenir la couleur de priorité
  const getPriorityColor = (priority?: 'low' | 'medium' | 'high') => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };
  
  // Obtenir l'icône et la couleur de statut
  const getStatusInfo = (status: AssignmentStatus) => {
    switch (status) {
      case AssignmentStatus.PENDING:
        return {
          icon: <FiAlertCircle className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />,
          text: 'En attente',
          color: 'text-yellow-600 dark:text-yellow-400'
        };
      case AssignmentStatus.IN_PROGRESS:
        return {
          icon: <FiInfo className="h-5 w-5 text-blue-500 dark:text-blue-400" />,
          text: 'En cours',
          color: 'text-blue-600 dark:text-blue-400'
        };
      case AssignmentStatus.COMPLETED:
        return {
          icon: <FiUserCheck className="h-5 w-5 text-green-500 dark:text-green-400" />,
          text: 'Terminé',
          color: 'text-green-600 dark:text-green-400'
        };
      case AssignmentStatus.CANCELLED:
        return {
          icon: <FiUserX className="h-5 w-5 text-red-500 dark:text-red-400" />,
          text: 'Annulé',
          color: 'text-red-600 dark:text-red-400'
        };
    }
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center">
          <FiUsers className="mr-2 text-indigo-600 dark:text-indigo-400" />
          Assignations
        </h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowAssignmentForm(!showAssignmentForm)}
            className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {showAssignmentForm ? 'Annuler' : 'Nouvelle assignation'}
          </button>
          <button 
            onClick={loadAssignments}
            className="p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/20"
            title="Rafraîchir les assignations"
            disabled={isLoading}
          >
            <svg className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {error && (
          <div className="p-3 mb-4 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}
        
        {/* Formulaire d'assignation */}
        {showAssignmentForm && (
          <form onSubmit={handleSubmitAssignment} className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
            <h4 className="text-md font-medium mb-3">
              {selectedAssignment ? 'Modifier l\'assignation' : 'Nouvelle assignation'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="assignTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assigner à <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="assignTo"
                  value={assignTo}
                  onChange={(e) => setAssignTo(e.target.value)}
                  placeholder="Nom de l'utilisateur"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                  disabled={isLoading || !!selectedAssignment}
                />
              </div>
              
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date d'échéance
                </label>
                <input
                  type="date"
                  id="dueDate"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description de la tâche à effectuer"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                rows={3}
                disabled={isLoading}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Priorité
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="priority"
                    value="low"
                    checked={priority === 'low'}
                    onChange={() => setPriority('low')}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Basse</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="priority"
                    value="medium"
                    checked={priority === 'medium'}
                    onChange={() => setPriority('medium')}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Moyenne</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="priority"
                    value="high"
                    checked={priority === 'high'}
                    onChange={() => setPriority('high')}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                    disabled={isLoading}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Haute</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                disabled={isLoading}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading || !assignTo.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Enregistrement...' : (selectedAssignment ? 'Mettre à jour' : 'Assigner')}
              </button>
            </div>
          </form>
        )}
        
        {/* Liste des assignations */}
        {isLoading && assignments.length === 0 ? (
          <div className="flex justify-center p-6">
            <svg className="animate-spin h-8 w-8 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 p-6">
            <p>Aucune assignation</p>
            <p className="text-sm mt-1">Créez une nouvelle assignation pour attribuer ce document à un utilisateur.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {assignments.map((assignment) => {
              const statusInfo = getStatusInfo(assignment.status);
              
              return (
                <li 
                  key={assignment.id} 
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  {/* En-tête de l'assignation */}
                  <div className="flex flex-wrap justify-between items-start gap-2">
                    <div className="flex items-center">
                      {statusInfo.icon}
                      <span className={`ml-2 font-medium ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                      <span className={`ml-4 text-sm ${getPriorityColor(assignment.priority)}`}>
                        Priorité: {assignment.priority === 'high' ? 'Haute' : assignment.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      {/* Boutons de changement de statut */}
                      {assignment.status !== AssignmentStatus.IN_PROGRESS && (
                        <button
                          onClick={() => handleUpdateStatus(assignment.id, AssignmentStatus.IN_PROGRESS)}
                          className="px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded"
                        >
                          Marquer en cours
                        </button>
                      )}
                      {assignment.status !== AssignmentStatus.COMPLETED && (
                        <button
                          onClick={() => handleUpdateStatus(assignment.id, AssignmentStatus.COMPLETED)}
                          className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded"
                        >
                          Marquer terminé
                        </button>
                      )}
                      {assignment.status !== AssignmentStatus.CANCELLED && assignment.status !== AssignmentStatus.COMPLETED && (
                        <button
                          onClick={() => handleUpdateStatus(assignment.id, AssignmentStatus.CANCELLED)}
                          className="px-2 py-1 text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded"
                        >
                          Annuler
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Informations d'assignation */}
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="flex items-center text-sm">
                      <FiUserCheck className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Assigné à: <span className="font-medium">{assignment.assignedTo}</span>
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <FiUsers className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Par: <span className="font-medium">{assignment.assignedBy}</span>
                      </span>
                    </div>
                    {assignment.dueDate && (
                      <div className="flex items-center text-sm">
                        <FiCalendar className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">
                          Date d'échéance: <span className="font-medium">{formatDate(assignment.dueDate)}</span>
                        </span>
                      </div>
                    )}
                    <div className="flex items-center text-sm">
                      <FiCalendar className="mr-2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Assigné le: <span className="font-medium">{formatDate(assignment.assignedAt)}</span>
                      </span>
                    </div>
                  </div>
                  
                  {/* Description */}
                  {assignment.description && (
                    <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                      <p className="font-medium">Description:</p>
                      <p className="mt-1 whitespace-pre-wrap">{assignment.description}</p>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="mt-3 flex justify-end space-x-2">
                    <button
                      onClick={() => handleEditAssignment(assignment)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full"
                      title="Modifier"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteAssignment(assignment.id)}
                      className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-full"
                      title="Supprimer"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DocumentAssignments;
