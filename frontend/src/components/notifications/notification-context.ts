import { createContext } from 'react';

export interface NotificationApi {
  notifySuccess: (message: string) => void;
  notifyError: (message: string) => void;
}

export const NotificationContext = createContext<NotificationApi | null>(null);
