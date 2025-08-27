import { useEffect } from 'react';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useUI, NOTIFICATION_TYPES } from '../../context/UIContext';

const iconMap = {
  [NOTIFICATION_TYPES.SUCCESS]: CheckCircleIcon,
  [NOTIFICATION_TYPES.ERROR]: XCircleIcon,
  [NOTIFICATION_TYPES.WARNING]: ExclamationTriangleIcon,
  [NOTIFICATION_TYPES.INFO]: InformationCircleIcon,
};

const colorMap = {
  [NOTIFICATION_TYPES.SUCCESS]: {
    bg: 'bg-green-50',
    text: 'text-green-800',
    icon: 'text-green-400',
    border: 'border-green-200',
  },
  [NOTIFICATION_TYPES.ERROR]: {
    bg: 'bg-red-50',
    text: 'text-red-800',
    icon: 'text-red-400',
    border: 'border-red-200',
  },
  [NOTIFICATION_TYPES.WARNING]: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-800',
    icon: 'text-yellow-400',
    border: 'border-yellow-200',
  },
  [NOTIFICATION_TYPES.INFO]: {
    bg: 'bg-blue-50',
    text: 'text-blue-800',
    icon: 'text-blue-400',
    border: 'border-blue-200',
  },
};

function NotificationItem({ notification, onRemove }) {
  const Icon = iconMap[notification.type];
  const colors = colorMap[notification.type];

  useEffect(() => {
    if (notification.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(notification.id);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification, onRemove]);

  return (
    <div
      className={`max-w-sm w-full ${colors.bg} ${colors.border} border rounded-lg shadow-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden`}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Icon className={`h-6 w-6 ${colors.icon}`} />
          </div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            <p className={`text-sm font-medium ${colors.text}`}>
              {notification.title}
            </p>
            {notification.message && (
              <p className={`mt-1 text-sm ${colors.text} opacity-75`}>
                {notification.message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={`bg-transparent rounded-md inline-flex ${colors.text} hover:${colors.text} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-${colors.bg} focus:ring-indigo-500`}
              onClick={() => onRemove(notification.id)}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Notifications() {
  const { notifications, removeNotification } = useUI();

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      aria-live="assertive"
      className="fixed inset-0 flex items-end justify-center px-4 py-6 pointer-events-none sm:p-6 sm:items-start sm:justify-end z-50"
    >
      <div className="w-full flex flex-col items-center space-y-4 sm:items-end">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </div>
  );
}

export default Notifications;