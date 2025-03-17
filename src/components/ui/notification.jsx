import React, { useState, useEffect, createContext, useContext } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Create a context for notifications
const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info', duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications(prev => [...prev, { id, message, type, duration }]);
    
    if (duration !== Infinity) {
      setTimeout(() => {
        removeNotification(id);
      }, duration);
    }
    
    return id;
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addNotification, removeNotification }}>
      {children}
      <NotificationContainer notifications={notifications} removeNotification={removeNotification} />
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Container component that displays all active notifications
const NotificationContainer = ({ notifications, removeNotification }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full">
      {notifications.map(notification => (
        <Notification 
          key={notification.id} 
          notification={notification} 
          onClose={() => removeNotification(notification.id)} 
        />
      ))}
    </div>
  );
};

// Individual notification component
const Notification = ({ notification, onClose }) => {
  const { message, type } = notification;
  
  const bgColor = {
    success: 'bg-green-100 border-green-500',
    error: 'bg-red-100 border-red-500',
    warning: 'bg-yellow-100 border-yellow-500',
    info: 'bg-blue-100 border-blue-500',
  }[type] || 'bg-gray-100 border-gray-500';
  
  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  }[type] || 'text-gray-800';

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  }[type] || Info;

  return (
    <div 
      className={`animate-slideIn rounded-md border-r-4 p-4 shadow-md ${bgColor} flex items-start gap-3 w-full`}
      role="alert"
    >
      <Icon className={`h-5 w-5 ${textColor} flex-shrink-0`} />
      <div className={`flex-1 ${textColor}`}>{message}</div>
      <button 
        onClick={onClose} 
        className={`${textColor} hover:bg-opacity-20 hover:bg-black rounded-full p-1`}
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// Standalone function to show notifications without context
// This is useful for components that don't have access to the context
export const showNotification = (message, type = 'info', duration = 5000) => {
  // Create a temporary DOM element for the notification
  const container = document.createElement('div');
  container.className = 'notification-container';
  document.body.appendChild(container);

  // Render the notification
  const notification = document.createElement('div');
  notification.className = `notification notification-${type} animate-slideIn`;
  
  const bgColor = {
    success: 'bg-green-100 border-green-500',
    error: 'bg-red-100 border-red-500',
    warning: 'bg-yellow-100 border-yellow-500',
    info: 'bg-blue-100 border-blue-500',
  }[type] || 'bg-gray-100 border-gray-500';
  
  const textColor = {
    success: 'text-green-800',
    error: 'text-red-800',
    warning: 'text-yellow-800',
    info: 'text-blue-800',
  }[type] || 'text-gray-800';

  notification.style.cssText = `
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 9999;
    max-width: 24rem;
    padding: 1rem;
    border-radius: 0.375rem;
    border-right-width: 4px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    display: flex;
    align-items: center;
    gap: 0.75rem;
  `;
  notification.className = `${bgColor} ${textColor}`;

  // Add icon based on type
  const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  iconSvg.setAttribute('width', '20');
  iconSvg.setAttribute('height', '20');
  iconSvg.setAttribute('viewBox', '0 0 24 24');
  iconSvg.setAttribute('fill', 'none');
  iconSvg.setAttribute('stroke', 'currentColor');
  iconSvg.setAttribute('stroke-width', '2');
  iconSvg.setAttribute('stroke-linecap', 'round');
  iconSvg.setAttribute('stroke-linejoin', 'round');
  
  let iconPath = '';
  switch (type) {
    case 'success':
      iconPath = '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>';
      break;
    case 'error':
      iconPath = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>';
      break;
    case 'warning':
      iconPath = '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line>';
      break;
    default:
      iconPath = '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line>';
  }
  
  iconSvg.innerHTML = iconPath;
  notification.appendChild(iconSvg);

  // Add message
  const messageElement = document.createElement('div');
  messageElement.textContent = message;
  messageElement.style.cssText = 'flex: 1;';
  notification.appendChild(messageElement);

  // Add close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
  closeButton.style.cssText = 'background: transparent; border: none; cursor: pointer; padding: 0.25rem; border-radius: 9999px;';
  closeButton.addEventListener('click', () => {
    notification.classList.remove('animate-slideIn');
    notification.classList.add('animate-slideOut');
    setTimeout(() => {
      if (document.body.contains(container)) {
        document.body.removeChild(container);
      }
    }, 300);
  });
  notification.appendChild(closeButton);

  container.appendChild(notification);

  // Auto-remove after duration
  if (duration !== Infinity) {
    setTimeout(() => {
      if (document.body.contains(container)) {
        notification.classList.remove('animate-slideIn');
        notification.classList.add('animate-slideOut');
        setTimeout(() => {
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
        }, 300);
      }
    }, duration);
  }

  return {
    close: () => {
      if (document.body.contains(container)) {
        notification.classList.remove('animate-slideIn');
        notification.classList.add('animate-slideOut');
        setTimeout(() => {
          if (document.body.contains(container)) {
            document.body.removeChild(container);
          }
        }, 300);
      }
    }
  };
}; 