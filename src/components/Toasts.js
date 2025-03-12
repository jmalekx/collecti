import { typography } from '../commonStyles';

// Toast type constants
export const TOAST_TYPES = {
  SUCCESS: 'success',
  DANGER: 'danger',
  WARNING: 'warning',
  INFO: 'info'
};

export const toastConfig = {
  containerStyle: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  textStyle: {
    fontFamily: typography.fontRegular,
    fontSize: 16,
  },
  // Type-specific styles
  success: {
    backgroundColor: '#e8f9e8',
    borderLeftColor: '#2ecc71',
    color: '#217a3e',
  },
  danger: {
    backgroundColor: '#fdecea',
    borderLeftColor: '#e74c3c',
    color: '#c0392b',
  },
  warning: {
    backgroundColor: '#fff3e0',
    borderLeftColor: '#f39c12',
    color: '#a36705',
  },
  info: {
    backgroundColor: '#eaf4ff',
    borderLeftColor: '#3498db',
    color: '#0056b3',
  }
};

// Helper function to show toasts with consistent styling
export const showToast = (toast, message, options = {}) => {
  const type = options.type || TOAST_TYPES.INFO;
  
  toast.show(
    message, 
    {
      type,
      placement: options.placement || "top",
      duration: options.duration || 4000,
      animationType: options.animationType || "slide-in",
      ...options
    }
  );
};