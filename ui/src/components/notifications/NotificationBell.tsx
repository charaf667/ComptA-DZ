/**
 * Composant d'icône de notification avec compteur et menu déroulant
 */
import React, { useState, useRef, useEffect } from 'react';
import { BiBell } from 'react-icons/bi';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../contexts/notification';
import NotificationItem from './NotificationItem';

// Styles pour le composant
const bellContainerStyle = "relative cursor-pointer";
const bellIconStyle = "text-2xl text-gray-600 hover:text-primary-600 transition-colors";
const bellCounterStyle = "absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center";
const dropdownContainerStyle = "absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 border border-gray-200 dark:bg-gray-800 dark:border-gray-700 max-h-96 overflow-y-auto";
const dropdownHeaderStyle = "px-4 py-2 text-sm font-semibold text-gray-700 border-b border-gray-200 flex justify-between items-center dark:text-gray-200 dark:border-gray-700";
const dropdownFooterStyle = "px-4 py-2 text-sm text-center border-t border-gray-200 dark:border-gray-700";
const emptyStateStyle = "py-6 text-center text-gray-500 dark:text-gray-400";
const viewAllButtonStyle = "text-primary-600 hover:underline text-sm";
const markAllReadButtonStyle = "text-xs text-gray-600 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400";

/**
 * Composant NotificationBell
 * Affiche une icône de cloche avec un compteur de notifications non lues
 * et un menu déroulant pour voir les notifications récentes
 */
const NotificationBell: React.FC = () => {
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead,
    loadNotifications 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Charger les notifications non lues quand le menu est ouvert
  useEffect(() => {
    if (isOpen) {
      loadNotifications({ 
        limit: 5, 
        isRead: false 
      });
    }
  }, [isOpen, loadNotifications]);

  // Fermer le menu quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Gérer le clic sur l'icône de notification
  const handleBellClick = () => {
    setIsOpen(!isOpen);
  };

  // Gérer le clic sur une notification
  const handleNotificationClick = (id: string) => {
    markAsRead(id);
    setIsOpen(false);
  };

  // Gérer le clic sur "Marquer tout comme lu"
  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    markAllAsRead();
  };

  return (
    <div className={bellContainerStyle} ref={dropdownRef}>
      {/* Icône de notification avec compteur */}
      <div onClick={handleBellClick} className="relative">
        <BiBell className={bellIconStyle} />
        {unreadCount > 0 && (
          <span className={bellCounterStyle}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      {/* Menu déroulant */}
      {isOpen && (
        <div className={dropdownContainerStyle}>
          {/* En-tête du menu */}
          <div className={dropdownHeaderStyle}>
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button 
                className={markAllReadButtonStyle}
                onClick={handleMarkAllRead}
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Corps du menu */}
          <div>
            {loading ? (
              <div className={emptyStateStyle}>Chargement...</div>
            ) : notifications.length === 0 ? (
              <div className={emptyStateStyle}>Aucune notification</div>
            ) : (
              notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification.id)}
                />
              ))
            )}
          </div>

          {/* Pied du menu */}
          <div className={dropdownFooterStyle}>
            <Link
              to="/notifications"
              className={viewAllButtonStyle}
              onClick={() => setIsOpen(false)}
            >
              Voir toutes les notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
