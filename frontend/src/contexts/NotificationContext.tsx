import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { fetchNotifications, createNotification as createNotificationApi, markNotificationAsRead } from '../utils/api';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Fetch notifications from backend on mount or when user changes
  React.useEffect(() => {
    const loadNotifications = async () => {
      if (user?.email) {
        try {
          const backendNotifications = await fetchNotifications(user.email);
          // Map backend notifications to frontend Notification type
          const mapped = backendNotifications.map((n: any) => ({
            id: n.id.toString(),
            type: n.type,
            title: n.title,
            message: n.message,
            timestamp: n.createdAt ? new Date(n.createdAt) : new Date(),
            read: n.read,
          }));
          setNotifications(mapped);
        } catch (e) {
          // Fallback: keep local notifications
        }
      }
    };
    loadNotifications();
  }, [user]);

  const addNotification = useCallback(async (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    if (user?.email) {
      try {
        const backendNotification = await createNotificationApi({
          userEmail: user.email,
          ...notification,
        });
        const mapped: Notification = {
          id: backendNotification.id.toString(),
          type: backendNotification.type,
          title: backendNotification.title,
          message: backendNotification.message,
          timestamp: backendNotification.createdAt ? new Date(backendNotification.createdAt) : new Date(),
          read: backendNotification.read,
        };
        setNotifications(prev => [mapped, ...prev]);
        return;
      } catch (e) {
        // fallback: add local notification if backend fails
      }
    }
    // fallback: local notification
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    try {
      await markNotificationAsRead(id);
    } catch (e) {
      // Ignore backend error, keep UI responsive
    }
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      markAsRead,
      clearNotifications,
      unreadCount
    }}>
      {children}
    </NotificationContext.Provider>
  );
};