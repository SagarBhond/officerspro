/**
 * Usage Examples:
 *
 * // Success notification
 * showSuccess('Success!', 'Data saved successfully.');
 *
 * // Error notification
 * showError('Error!', 'Failed to save data.');
 *
 * // Warning notification
 * showWarning('Warning!', 'Please check your input.');
 *
 * // Info notification
 * showInfo('Info', 'New update available.');
 *
 * // Loading state
 * await showLoading('Saving...');
 * // Do some async operation
 * closeLoading();
 *
 * // Confirmation dialog
 * const confirmed = await showConfirm('Delete?', 'This action cannot be undone.');
 * if (confirmed) {
 *   // Delete operation
 * }
 */

import { createContext, useContext, ReactNode } from 'react';
import Swal from 'sweetalert2';

interface NotificationContextType {
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  showInfo: (title: string, message: string) => void;
  showLoading: (title: string) => Promise<void>;
  closeLoading: () => void;
  showConfirm: (title: string, message: string, confirmText?: string, cancelText?: string) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const showSuccess = (title: string, message: string) => {
    Swal.fire({
      icon: 'success',
      title: title,
      text: message,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'bottom-end',
      background: '#10B981',
      color: '#fff',
      width: '300px',
      customClass: {
        popup: 'bottom-right-toast-success',
        title: 'text-xs font-medium',
      },
    });
  };

  const showError = (title: string, message: string = '') => {
    Swal.fire({
      icon: 'error',
      title: title,
      text: message, // Show message only if provided
      timer: 4000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'bottom-end',
      background: '#EF4444',
      color: '#fff',
      width: '300px',
      customClass: {
        popup: 'bottom-right-toast-error',
        title: 'text-xs font-medium',
      },
    });
  };

  const showWarning = (title: string, message: string) => {
    Swal.fire({
      icon: 'warning',
      title: title,
      text: message,
      timer: 3000,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'bottom-end',
      background: '#F59E0B',
      color: '#fff',
      width: '300px',
      customClass: {
        popup: 'bottom-right-toast-warning',
        title: 'text-xs font-medium',
      },
    });
  };

  const showInfo = (title: string, message: string) => {
    Swal.fire({
      icon: 'info',
      title: title,
      text: message,
      timer: 2500,
      timerProgressBar: true,
      showConfirmButton: false,
      toast: true,
      position: 'bottom-end',
      background: '#3B82F6',
      color: '#fff',
      width: '300px',
      customClass: {
        popup: 'bottom-right-toast-info',
        title: 'text-xs font-medium',
      },
    });
  };

  const showLoading = async (title: string = 'Processing...'): Promise<void> => {
    Swal.fire({
      title: title,
      text: 'Please wait...',
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  };

  const closeLoading = () => {
    Swal.close();
  };

  const showConfirm = async (
    title: string,
    message: string,
    confirmText: string = 'Yes',
    cancelText: string = 'Cancel'
  ): Promise<boolean> => {
    const result = await Swal.fire({
      icon: 'question',
      title: title,
      text: message,
      showCancelButton: true,
      confirmButtonText: confirmText,
      cancelButtonText: cancelText,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      background: '#F9FAFB',
      customClass: {
        title: 'text-lg font-semibold',
        popup: 'rounded-xl shadow-xl',
      },
    });
    return result.isConfirmed;
  };

  const value: NotificationContextType = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showLoading,
    closeLoading,
    showConfirm,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
