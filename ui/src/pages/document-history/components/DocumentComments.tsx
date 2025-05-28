import React, { useState, useEffect } from 'react';
import { FiMessageSquare, FiCheck, FiEdit2, FiTrash2, FiUser, FiX } from 'react-icons/fi';
import documentCollaborationService from '../../../services/document-collaboration.service';
import type { DocumentComment } from '../../../types/document-collaboration';
import type { ProcessedDocument } from '../../../types/document-history';
import { useAuth } from '../../../contexts/auth/AuthContext';

interface DocumentCommentsProps {
  document: ProcessedDocument;
  className?: string;
}

const DocumentComments: React.FC<DocumentCommentsProps> = ({
  document,
  className = ''
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<DocumentComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [showResolved, setShowResolved] = useState(false);

  // Charger les commentaires lors du chargement du composant
  useEffect(() => {
    if (document.id) {
      loadComments();
    }
  }, [document.id, showResolved]);

  // Charger les commentaires du document
  const loadComments = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await documentCollaborationService.getComments({
        documentId: document.id,
        includeResolved: showResolved,
        sortDirection: 'desc'
      });

      setComments(result);
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
      setError("Impossible de charger les commentaires");
    } finally {
      setIsLoading(false);
    }
  };

  // Soumettre un nouveau commentaire
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await documentCollaborationService.createComment({
        documentId: document.id,
        createdBy: user?.nom || 'Utilisateur anonyme',
        content: newComment.trim()
      });

      setNewComment('');
      loadComments();
    } catch (error) {
      console.error('Erreur lors de la création du commentaire:', error);
      setError("Impossible d'ajouter le commentaire");
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer un commentaire
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce commentaire ?')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await documentCollaborationService.deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Erreur lors de la suppression du commentaire:', error);
      setError("Impossible de supprimer le commentaire");
    } finally {
      setIsLoading(false);
    }
  };

  // Commencer à éditer un commentaire
  const handleStartEditing = (comment: DocumentComment) => {
    setEditingComment(comment.id);
    setEditText(comment.content);
  };

  // Annuler l'édition d'un commentaire
  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  // Sauvegarder les modifications d'un commentaire
  const handleSaveEdit = async (commentId: string) => {
    if (!editText.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      await documentCollaborationService.updateComment(commentId, {
        content: editText.trim()
      });

      setComments(comments.map(c => 
        c.id === commentId ? { ...c, content: editText.trim(), updatedAt: new Date().toISOString() } : c
      ));
      setEditingComment(null);
      setEditText('');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du commentaire:', error);
      setError("Impossible de mettre à jour le commentaire");
    } finally {
      setIsLoading(false);
    }
  };

  // Marquer un commentaire comme résolu ou non résolu
  const handleToggleResolution = async (commentId: string, currentStatus: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      await documentCollaborationService.toggleCommentResolution(commentId, !currentStatus);
      
      if (!showResolved && !currentStatus) {
        // Si on marque comme résolu et qu'on ne montre pas les résolus, on le retire de la liste
        setComments(comments.filter(c => c.id !== commentId));
      } else {
        // Sinon on met à jour son statut
        setComments(comments.map(c => 
          c.id === commentId ? { ...c, isResolved: !currentStatus } : c
        ));
      }
    } catch (error) {
      console.error('Erreur lors du changement de statut du commentaire:', error);
      setError("Impossible de changer le statut du commentaire");
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
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow ${className}`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-medium flex items-center">
          <FiMessageSquare className="mr-2 text-indigo-600 dark:text-indigo-400" />
          Commentaires
        </h3>
        <div className="flex items-center">
          <label className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={() => setShowResolved(!showResolved)}
              className="mr-2 rounded border-gray-300 dark:border-gray-600"
            />
            Afficher les commentaires résolus
          </label>
          <button 
            onClick={loadComments}
            className="ml-4 p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700/20"
            title="Rafraîchir les commentaires"
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
        
        {/* Formulaire d'ajout de commentaire */}
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex items-start">
            <div className="w-full">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Ajouter un commentaire..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                rows={3}
                disabled={isLoading}
              />
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading || !newComment.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </div>
          </div>
        </form>
        
        {/* Liste des commentaires */}
        {isLoading && comments.length === 0 ? (
          <div className="flex justify-center p-6">
            <svg className="animate-spin h-8 w-8 text-indigo-600 dark:text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 p-6">
            <p>Aucun commentaire</p>
            <p className="text-sm mt-1">Soyez le premier à commenter ce document.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {comments.map((comment) => (
              <li 
                key={comment.id} 
                className={`p-4 border border-gray-200 dark:border-gray-700 rounded-lg ${
                  comment.isResolved ? 'bg-green-50 dark:bg-green-900/10' : 'bg-white dark:bg-gray-800'
                }`}
              >
                {/* En-tête du commentaire */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <FiUser className="mr-2 h-5 w-5 text-gray-500 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-gray-100">{comment.createdBy}</span>
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(comment.createdAt)}
                    </span>
                    {comment.updatedAt && (
                      <span className="ml-2 text-xs text-gray-500 dark:text-gray-400 italic">
                        (modifié le {formatDate(comment.updatedAt)})
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    {/* Bouton pour marquer comme résolu/non résolu */}
                    <button
                      onClick={() => handleToggleResolution(comment.id, !!comment.isResolved)}
                      className={`p-1 rounded-full ${
                        comment.isResolved
                          ? 'text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400'
                          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                      title={comment.isResolved ? "Marquer comme non résolu" : "Marquer comme résolu"}
                    >
                      {comment.isResolved ? <FiX size={16} /> : <FiCheck size={16} />}
                    </button>
                    
                    {/* Bouton d'édition */}
                    <button
                      onClick={() => handleStartEditing(comment)}
                      className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 rounded-full"
                      title="Modifier"
                    >
                      <FiEdit2 size={16} />
                    </button>
                    
                    {/* Bouton de suppression */}
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded-full"
                      title="Supprimer"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                </div>
                
                {/* Contenu du commentaire */}
                {editingComment === comment.id ? (
                  <div className="mt-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      rows={3}
                    />
                    <div className="mt-2 flex justify-end space-x-2">
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={() => handleSaveEdit(comment.id)}
                        disabled={!editText.trim()}
                        className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Enregistrer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {comment.content}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default DocumentComments;
