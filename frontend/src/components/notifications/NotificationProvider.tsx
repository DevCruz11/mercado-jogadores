import { ReactNode, useCallback, useMemo, useState } from 'react';
import { NotificationApi, NotificationContext } from './notification-context';

const DISPLAY_TIME_MS = 6000;

interface Notification {
  id: number;
  kind: 'success' | 'error';
  message: string;
}

let nextNotificationId = 1;

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const dismiss = useCallback((id: number) => {
    setNotifications((current) => current.filter((notification) => notification.id !== id));
  }, []);

  const push = useCallback(
    (kind: Notification['kind'], message: string) => {
      const id = nextNotificationId++;
      setNotifications((current) => [...current, { id, kind, message }]);
      window.setTimeout(() => dismiss(id), DISPLAY_TIME_MS);
    },
    [dismiss],
  );

  const api = useMemo<NotificationApi>(
    () => ({
      notifySuccess: (message) => push('success', message),
      notifyError: (message) => push('error', message),
    }),
    [push],
  );

  return (
    <NotificationContext.Provider value={api}>
      {children}
      <div className="notifications" aria-live="polite">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`notification notification--${notification.kind}`}
            role={notification.kind === 'error' ? 'alert' : 'status'}
          >
            <span>{notification.message}</span>
            <button
              type="button"
              className="notification__close"
              aria-label="Fechar aviso"
              onClick={() => dismiss(notification.id)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
