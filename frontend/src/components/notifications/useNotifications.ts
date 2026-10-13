import { useContext } from 'react';
import { NotificationApi, NotificationContext } from './notification-context';

export function useNotifications(): NotificationApi {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de NotificationProvider.');
  }
  return context;
}
