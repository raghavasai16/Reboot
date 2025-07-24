import React, { useState } from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import { Bell, X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import { playNotification } from '../utils/audioFeedback';

const NotificationCenter: React.FC = () => {
  const { notifications, markAsRead, clearNotifications } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <>
      {/* Notification Bell */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) playNotification();
        }}
        className="fixed top-4 right-4 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors z-50"
        aria-label="Open notifications"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5 text-gray-600" />
        {notifications.filter(n => !n.read).length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {notifications.filter(n => !n.read).length}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="fixed top-16 right-4 w-80 max-h-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden" role="alert" aria-live="polite">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearNotifications}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Clear all notifications"
              >
                Clear All
              </Button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close notifications panel"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto max-h-80">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start space-x-3">
                    {getIcon(notification.type)}
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-2">
                        {notification.timestamp.toLocaleString()}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationCenter;