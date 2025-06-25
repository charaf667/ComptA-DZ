/**
 * Page de gestion des notifications
 * Permet de voir toutes les notifications et de gérer les préférences
 */
import React, { useEffect, useState } from 'react';
import { Tab } from '@headlessui/react';
import { BiTrash, BiCheck, BiTestTube } from 'react-icons/bi';
import { useNotifications } from '../../contexts/notification/NotificationContext';
import NotificationItem from '../../components/notifications/NotificationItem';
import { NotificationType } from '../../services/notification.service';
import axios from 'axios';

// Styles pour les composants
const pageContainerStyle = "container mx-auto px-4 py-6";
const pageTitleStyle = "text-2xl font-bold text-gray-800 dark:text-white mb-6";
const tabListStyle = "flex space-x-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800";
const tabButtonStyle = "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-gray-700 dark:text-gray-300";
const tabButtonSelectedStyle = "bg-white shadow dark:bg-gray-700 dark:text-white";
const emptyStateStyle = "text-center py-12 text-gray-500 dark:text-gray-400";
const actionButtonStyle = "px-3 py-1 text-sm rounded-md text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 flex items-center";
const filterContainerStyle = "flex items-center space-x-4 mb-4";
const filterSelectStyle = "bg-white border border-gray-300 rounded-md px-3 py-1 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300";
const loadMoreButtonStyle = "w-full mt-4 py-2 text-sm text-primary-600 bg-white border border-primary-600 rounded-md hover:bg-primary-50 dark:bg-gray-800 dark:text-primary-400 dark:border-primary-400 dark:hover:bg-gray-700";
const preferencesSectionStyle = "bg-white rounded-lg shadow p-6 dark:bg-gray-800 mt-6";
const preferencesTitleStyle = "text-lg font-semibold text-gray-800 dark:text-white mb-4";
const preferencesDescriptionStyle = "text-sm text-gray-600 dark:text-gray-400 mb-6";
const preferenceItemStyle = "flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0";
const preferenceItemLabelStyle = "text-gray-700 dark:text-gray-300";
const preferenceItemDescriptionStyle = "text-sm text-gray-500 dark:text-gray-400 mt-1";

/**
 * Page de gestion des notifications
 */
const NotificationsPage: React.FC = () => {
  const {
    notifications,
    unreadCount,
    loading,
    hasMore,
    preferences,
    loadNotifications,
    loadMore,
    markAsRead,
    markAllAsRead,
    deleteAllNotifications,
    loadPreferences,
    updatePreferences
  } = useNotifications();

  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');
  const [testLoading, setTestLoading] = useState<boolean>(false);
  
  // Fonction pour créer une notification de test
  const createTestNotification = async (type: string, title: string, message: string) => {
    setTestLoading(true);
    try {
      // Récupérer le token d'auth depuis localStorage ou utiliser un token de développement
      const token = localStorage.getItem('auth_token') || 'fake_token_123';
      console.log('Utilisation du token:', token);
      
      await axios.post(
        `${import.meta.env.VITE_API_URL || 'http://localhost:4000/api'}/notifications/test`,
        { type, title, message },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      // Recharger les notifications après création
      loadNotifications();
    } catch (error: any) {
      console.error('Erreur lors de la création de la notification de test:', error);
      // Afficher plus de détails sur l'erreur
      if (error.response) {
        console.error('Détails de l\'erreur:', error.response.data);
      }
    } finally {
      setTestLoading(false);
    }
  };
  
  // Fonction pour créer plusieurs notifications de test d'un coup
  const createAllTestNotifications = async () => {
    setTestLoading(true);
    try {
      // Créer différents types de notifications
      await Promise.all([
        createTestNotification('COMMENT', 'Nouveau commentaire', 'Karim a commenté sur la facture #F-2025-012'),
        createTestNotification('COMMENT_RESOLVED', 'Commentaire résolu', 'Amina a résolu votre commentaire'),
        createTestNotification('ASSIGNMENT', 'Document assigné', 'Vous avez été assigné au document Facture'),
        createTestNotification('ASSIGNMENT_STATUS', 'Statut modifié', 'Le statut du document a été changé à "En validation"'),
        createTestNotification('DOCUMENT_UPDATED', 'Document mis à jour', 'Le document a été mis à jour'),
        createTestNotification('DUE_DATE', 'Échéance approchante', 'La date limite est dans 3 jours'),
        createTestNotification('SYSTEM', 'Mise à jour système', 'Une nouvelle version a été déployée')
      ]);
    } catch (error) {
      console.error('Erreur lors de la création des notifications de test:', error);
    } finally {
      setTestLoading(false);
    }
  };

  // Charger les notifications au chargement de la page
  useEffect(() => {
    loadNotifications();
    loadPreferences();
  }, [loadNotifications, loadPreferences]);

  // Appliquer les filtres lors de leur modification
  useEffect(() => {
    const query: any = { limit: 20 };
    
    if (filterType !== 'all') {
      query.type = filterType;
    }
    
    if (filterRead !== 'all') {
      query.isRead = filterRead === 'read';
    }
    
    loadNotifications(query);
  }, [filterType, filterRead, loadNotifications]);

  // Gérer le changement de filtre de type
  const handleTypeFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterType(e.target.value);
  };

  // Gérer le changement de filtre de lecture
  const handleReadFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilterRead(e.target.value);
  };

  // Gérer le changement de préférence
  const handlePreferenceChange = (key: string, value: boolean) => {
    if (preferences) {
      updatePreferences(key, value);
    }
  };

  return (
    <div className={pageContainerStyle}>
      <div className="flex justify-between items-center mb-4">
        <h1 className={pageTitleStyle}>Notifications</h1>
        
        {/* Bouton de test uniquement visible en mode développement */}
        {import.meta.env.DEV && (
          <button 
            onClick={createAllTestNotifications}
            disabled={testLoading}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
          >
            <BiTestTube className="mr-2" /> 
            {testLoading ? 'Création en cours...' : 'Créer des notifications de test'}
          </button>
        )}
      </div>
      
      <Tab.Group>
        <Tab.List className={tabListStyle}>
          <Tab
            className={({ selected }: { selected: boolean }) =>
              `${tabButtonStyle} ${selected ? tabButtonSelectedStyle : ''}`
            }
          >
            Notifications
          </Tab>
          <Tab
            className={({ selected }: { selected: boolean }) =>
              `${tabButtonStyle} ${selected ? tabButtonSelectedStyle : ''}`
            }
          >
            Préférences
          </Tab>
        </Tab.List>
        
        <Tab.Panels className="mt-4">
          {/* Panneau des notifications */}
          <Tab.Panel>
            {/* Actions et filtres */}
            <div className="flex justify-between items-center mb-6">
              <div className="space-x-2">
                <button 
                  className={actionButtonStyle}
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  <BiCheck className="mr-1" /> Tout marquer comme lu
                </button>
                <button 
                  className={actionButtonStyle}
                  onClick={deleteAllNotifications}
                  disabled={notifications.length === 0}
                >
                  <BiTrash className="mr-1" /> Supprimer tout
                </button>
              </div>
              
              <div className={filterContainerStyle}>
                <select 
                  className={filterSelectStyle}
                  value={filterType}
                  onChange={handleTypeFilterChange}
                >
                  <option value="all">Tous les types</option>
                  <option value={NotificationType.COMMENT}>Commentaires</option>
                  <option value={NotificationType.COMMENT_RESOLVED}>Commentaires résolus</option>
                  <option value={NotificationType.ASSIGNMENT}>Assignations</option>
                  <option value={NotificationType.ASSIGNMENT_STATUS}>Changements de statut</option>
                  <option value={NotificationType.DOCUMENT_UPDATED}>Documents mis à jour</option>
                  <option value={NotificationType.DUE_DATE}>Échéances</option>
                  <option value={NotificationType.SYSTEM}>Système</option>
                </select>
                
                <select 
                  className={filterSelectStyle}
                  value={filterRead}
                  onChange={handleReadFilterChange}
                >
                  <option value="all">Lues et non lues</option>
                  <option value="unread">Non lues</option>
                  <option value="read">Lues</option>
                </select>
              </div>
            </div>
            
            {/* Liste des notifications */}
            <div className="bg-white rounded-lg shadow dark:bg-gray-800">
              {loading && notifications.length === 0 ? (
                <div className={emptyStateStyle}>Chargement...</div>
              ) : notifications.length === 0 ? (
                <div className={emptyStateStyle}>
                  Aucune notification à afficher
                </div>
              ) : (
                <>
                  <div>
                    {notifications.map(notification => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onClick={() => markAsRead(notification.id)}
                      />
                    ))}
                  </div>
                  
                  {hasMore && (
                    <div className="p-4">
                      <button 
                        className={loadMoreButtonStyle}
                        onClick={loadMore}
                        disabled={loading}
                      >
                        {loading ? 'Chargement...' : 'Charger plus'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </Tab.Panel>
          
          {/* Panneau des préférences */}
          <Tab.Panel>
            <div className={preferencesSectionStyle}>
              <h2 className={preferencesTitleStyle}>Préférences de notification</h2>
              <p className={preferencesDescriptionStyle}>
                Personnalisez les types de notifications que vous souhaitez recevoir.
                Vous pouvez activer ou désactiver chaque type selon vos besoins.
              </p>
              
              {preferences ? (
                <div>
                  <div className={preferenceItemStyle}>
                    <div>
                      <div className={preferenceItemLabelStyle}>Commentaires</div>
                      <div className={preferenceItemDescriptionStyle}>
                        Notifications pour les nouveaux commentaires sur les documents
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={preferences.commentNotifications}
                        onChange={e => handlePreferenceChange('commentNotifications', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  
                  <div className={preferenceItemStyle}>
                    <div>
                      <div className={preferenceItemLabelStyle}>Assignations</div>
                      <div className={preferenceItemDescriptionStyle}>
                        Notifications lorsque vous êtes assigné à un document
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={preferences.assignmentNotifications}
                        onChange={e => handlePreferenceChange('assignmentNotifications', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  
                  <div className={preferenceItemStyle}>
                    <div>
                      <div className={preferenceItemLabelStyle}>Mises à jour de documents</div>
                      <div className={preferenceItemDescriptionStyle}>
                        Notifications lorsqu'un document est mis à jour
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={preferences.documentUpdateNotifications}
                        onChange={e => handlePreferenceChange('documentUpdateNotifications', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  
                  <div className={preferenceItemStyle}>
                    <div>
                      <div className={preferenceItemLabelStyle}>Échéances</div>
                      <div className={preferenceItemDescriptionStyle}>
                        Notifications pour les échéances approchantes
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={preferences.dueDateNotifications}
                        onChange={e => handlePreferenceChange('dueDateNotifications', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                  
                  <div className={preferenceItemStyle}>
                    <div>
                      <div className={preferenceItemLabelStyle}>Système</div>
                      <div className={preferenceItemDescriptionStyle}>
                        Notifications système et mises à jour importantes
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={preferences.systemNotifications}
                        onChange={e => handlePreferenceChange('systemNotifications', e.target.checked)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              ) : (
                <div className={emptyStateStyle}>
                  Chargement des préférences...
                </div>
              )}
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab.Group>
    </div>
  );
};

export default NotificationsPage;
