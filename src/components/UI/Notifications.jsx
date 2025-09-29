import { useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
} from 'lucide-react';
import { useUI, NOTIFICATION_TYPES } from '../../context/UIContext';

const iconMap = {
  [NOTIFICATION_TYPES.SUCCESS]: CheckCircle2,
  [NOTIFICATION_TYPES.ERROR]: XCircle,
  [NOTIFICATION_TYPES.WARNING]: AlertTriangle,
  [NOTIFICATION_TYPES.INFO]: Info,
};

const colorMap = {
  [NOTIFICATION_TYPES.SUCCESS]: {
    bgColor: '#1c2d1c',
    textColor: '#4ade80',
    iconColor: '#22c55e',
    borderColor: '#16a34a',
    titleColor: '#ebebeb',
  },
  [NOTIFICATION_TYPES.ERROR]: {
    bgColor: '#2d1c1c',
    textColor: '#f87171',
    iconColor: '#ef4444',
    borderColor: '#dc2626',
    titleColor: '#ebebeb',
  },
  [NOTIFICATION_TYPES.WARNING]: {
    bgColor: '#2d291c',
    textColor: '#fbbf24',
    iconColor: '#f59e0b',
    borderColor: '#d97706',
    titleColor: '#ebebeb',
  },
  [NOTIFICATION_TYPES.INFO]: {
    bgColor: '#1c2433',
    textColor: '#60a5fa',
    iconColor: '#3b82f6',
    borderColor: '#2563eb',
    titleColor: '#ebebeb',
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
      style={{
        maxWidth: '24rem',
        width: '100%',
        backgroundColor: colors.bgColor,
        border: `1px solid ${colors.borderColor}`,
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
        pointerEvents: 'auto',
        overflow: 'hidden'
      }}
    >
      <div style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <div style={{ flexShrink: 0 }}>
            <Icon style={{ height: '24px', width: '24px', color: colors.iconColor }} />
          </div>
          <div style={{ marginLeft: '12px', width: 0, flex: '1 1 0%', paddingTop: '2px' }}>
            <p style={{
              fontSize: '14px',
              fontWeight: '600',
              color: colors.titleColor
            }}>
              {notification.title}
            </p>
            {notification.message && (
              <p style={{
                marginTop: '4px',
                fontSize: '14px',
                color: colors.textColor,
                opacity: 0.9
              }}>
                {notification.message}
              </p>
            )}
          </div>
          <div style={{ marginLeft: '16px', flexShrink: 0, display: 'flex' }}>
            <button
              style={{
                backgroundColor: 'transparent',
                borderRadius: '6px',
                display: 'inline-flex',
                color: colors.textColor,
                border: 'none',
                cursor: 'pointer',
                outline: 'none',
                padding: '4px',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                e.target.style.color = colors.titleColor;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = colors.textColor;
              }}
              onClick={() => onRemove(notification.id)}
            >
              <span className="sr-only">Close</span>
              <X style={{ height: '20px', width: '20px' }} />
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