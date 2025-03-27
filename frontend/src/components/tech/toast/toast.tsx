import React, { ReactNode } from 'react';
import { Toaster, toast as hotToast, ToastOptions } from 'react-hot-toast';
import './toast.css';

/**
 * Toast types
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning';

/**
 * Default toast options
 */
const defaultOptions: ToastOptions = {
  duration: 3000,
  position: 'top-right',
  style: {
    borderRadius: 'var(--border-radius-md)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    fontFamily: 'var(--font-family-base)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 'var(--font-weight-medium)',
    boxShadow: 'var(--shadow-popup)',
  },
};

/**
 * Toast options by type
 */
const typeOptions: Record<ToastType, ToastOptions> = {
  success: {
    ...defaultOptions,
    className: 'toast-success',
    icon: '✓',
  },
  error: {
    ...defaultOptions,
    className: 'toast-error',
    icon: '✕',
    duration: 4000, // Errors stay a bit longer
  },
  info: {
    ...defaultOptions,
    className: 'toast-info',
    icon: 'ℹ',
  },
  warning: {
    ...defaultOptions,
    className: 'toast-warning',
    icon: '⚠',
    duration: 4000, // Warnings stay a bit longer
  },
};

/**
 * Toast API
 */
export const toast = {
  /**
   * Show success toast
   * @param message Toast message
   * @param options Additional toast options
   */
  success: (message: string, options?: ToastOptions) => {
    return hotToast(message, { ...typeOptions.success, ...options });
  },

  /**
   * Show error toast
   * @param message Toast message
   * @param options Additional toast options
   */
  error: (message: string, options?: ToastOptions) => {
    return hotToast(message, { ...typeOptions.error, ...options });
  },

  /**
   * Show info toast
   * @param message Toast message
   * @param options Additional toast options
   */
  info: (message: string, options?: ToastOptions) => {
    return hotToast(message, { ...typeOptions.info, ...options });
  },

  /**
   * Show warning toast
   * @param message Toast message
   * @param options Additional toast options
   */
  warning: (message: string, options?: ToastOptions) => {
    return hotToast(message, { ...typeOptions.warning, ...options });
  },

  /**
   * Dismiss all toasts
   */
  dismiss: () => {
    hotToast.dismiss();
  },

  /**
   * Dismiss a specific toast
   * @param id Toast ID
   */
  dismissById: (id: string) => {
    hotToast.dismiss(id);
  },
};

/**
 * ToastProvider props
 */
interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Toast provider component
 * Wraps the application with the Toaster component from react-hot-toast
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        containerStyle={{
          zIndex: 'var(--z-index-tooltip)',
        }}
      />
    </>
  );
};
