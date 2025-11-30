import React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useApp } from '../../api/context/AppContext';
import './NotificationToast.css';

export default function NotificationToast() {
  const { notifications, removeNotification } = useApp();

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />;
      case 'danger':
        return <AlertCircle size={20} />;
      case 'warning':
        return <AlertTriangle size={20} />;
      case 'info':
        return <Info size={20} />;
      default:
        return <Info size={20} />;
    }
  };

  const getTitle = (type) => {
    switch (type) {
      case 'success':
        return 'Success';
      case 'danger':
        return 'Error';
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Info';
      default:
        return 'Notification';
    }
  };

  return (
    <div className="notification-toast-container">
      {notifications.map(notification => (
        <div key={notification.id} className={`notification-toast toast-${notification.type}`}>
          <div className="toast-content">
            <div className="toast-icon-wrapper">
              <div className={`toast-icon-bg toast-icon-bg-${notification.type}`}>
                <span className="toast-icon">{getIcon(notification.type)}</span>
              </div>
            </div>
            
            <div className="toast-text">
              <div className="toast-title">{getTitle(notification.type)}</div>
              <div className="toast-message">{notification.message}</div>
            </div>

            <button 
              className="toast-close-btn"
              onClick={() => removeNotification(notification.id)}
              aria-label="Close notification"
            >
              <X size={18} />
            </button>
          </div>

          <div className={`toast-progress toast-progress-${notification.type}`}></div>
        </div>
      ))}
    </div>
  );
}