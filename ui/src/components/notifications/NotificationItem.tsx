/**
 * Composant d'élément de notification individuel
 * Affiche une notification avec son icône, titre, message et heure
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  BiComment, 
  BiCheckCircle, 
  BiTask, 
  BiRefresh, 
  BiFile, 
  BiAlarm, 
  BiInfoCircle 
} from 'react-icons/bi';
import { NotificationType, NotificationPriority } from '../../services/notification.service';
import type { Notification } from '../../services/notification.service';

// Styles pour le composant
const containerStyle = "flex p-3 border-b border-gray-200 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-700 transition-colors cursor-pointer";
const unreadIndicatorStyle = "w-2 h-2 bg-primary-500 rounded-full mt-1.5 mr-2";
const iconContainerStyle = "flex-shrink-0 w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center mr-3";
const contentContainerStyle = "flex-1";
const titleStyle = "text-sm font-semibold text-gray-800 dark:text-gray-200";
const messageStyle = "text-sm text-gray-600 dark:text-gray-300 mt-0.5 line-clamp-2";
const timeStyle = "text-xs text-gray-500 dark:text-gray-400 mt-1";

// Style de priorité
const priorityStyles = {
  [NotificationPriority.LOW]: "",
  [NotificationPriority.MEDIUM]: "border-l-2 border-yellow-500",
  [NotificationPriority.HIGH]: "border-l-2 border-red-500",
};

// Mapping des icônes par type de notification
const notificationIcons = {
  [NotificationType.COMMENT]: <BiComment className="text-xl text-primary-500" />,
  [NotificationType.COMMENT_RESOLVED]: <BiCheckCircle className="text-xl text-green-500" />,
  [NotificationType.ASSIGNMENT]: <BiTask className="text-xl text-purple-500" />,
  [NotificationType.ASSIGNMENT_STATUS]: <BiRefresh className="text-xl text-blue-500" />,
  [NotificationType.DOCUMENT_UPDATED]: <BiFile className="text-xl text-yellow-500" />,
  [NotificationType.DUE_DATE]: <BiAlarm className="text-xl text-red-500" />,
  [NotificationType.SYSTEM]: <BiInfoCircle className="text-xl text-gray-500" />,
};

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

/**
 * Composant NotificationItem
 * Affiche une notification avec son icône, titre, message et heure
 */
const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onClick }) => {
  // Formatage de la date relative (ex: "il y a 5 minutes")
  const formattedTime = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
    locale: fr
  });

  const containerClassName = `${containerStyle} ${
    priorityStyles[notification.priority] || ""
  }`;

  const renderContent = () => (
    <>
      {!notification.isRead && <div className={unreadIndicatorStyle}></div>}
      <div className={iconContainerStyle}>
        {notificationIcons[notification.type] || notificationIcons[NotificationType.SYSTEM]}
      </div>
      <div className={contentContainerStyle}>
        <div className={titleStyle}>{notification.title}</div>
        <div className={messageStyle}>{notification.message}</div>
        <div className={timeStyle}>{formattedTime}</div>
      </div>
    </>
  );

  // Si la notification a un lien, l'afficher comme un lien
  if (notification.link) {
    return (
      <Link to={notification.link} className={containerClassName} onClick={onClick}>
        {renderContent()}
      </Link>
    );
  }

  // Sinon, l'afficher comme un div cliquable
  return (
    <div className={containerClassName} onClick={onClick}>
      {renderContent()}
    </div>
  );
};

export default NotificationItem;
