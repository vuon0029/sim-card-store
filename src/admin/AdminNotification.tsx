import { useEffect } from 'react';
import './admin.css';

export type NotificationType = 'success' | 'error';

export interface AdminNotificationProps {
  message: string;
  type: NotificationType;
  timeout?: number;
  onClose: () => void;
}

export function AdminNotification({
  message,
  type,
  timeout = 3000,
  onClose,
}: AdminNotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, onClose]);

  return (
    <div
      className={`admin-notification admin-notification--${type}`}
      role="alert"
      aria-live="assertive"
    >
      <span className="admin-notification__icon">
        {type === 'success' ? '✓' : '✕'}
      </span>
      <span className="admin-notification__message">{message}</span>
      <button
        className="admin-notification__close"
        onClick={onClose}
        aria-label="Đóng thông báo"
      >
        ×
      </button>
    </div>
  );
}
