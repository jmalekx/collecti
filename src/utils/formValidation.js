//Project services and utilities
import { showToast, TOAST_TYPES } from '../components/utilities/Toasts';

/*
  Form Validation Utility Module

  Implements centralised validation functions for form inputs. 
  Different validation algorithms can be applied based on context requirements.
  For stateless functions
  
*/

const formValidation = {
  //Using regex to validate email format
  isValidEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  },

  //Basic security policy for validating password
  isValidPassword: (password) => {
    return password.length >= 6;
  },

  //Validating username
  isValidUsername: (username) => {
    //Username optional
    if (!username || username.trim() === '') return true;
    
    //If provided, must be at least 3 characters
    return username.trim().length >= 3;
  },

  //Validating signup form toasts
  validateSignupForm: (formData, toast) => {
    const { username, email, password, confirmPassword } = formData;

    //Username
    if (username && username.trim() && !formValidation.isValidUsername(username)) {
      showToast(toast, "Username must be at least 3 characters", { type: TOAST_TYPES.WARNING });
      return false;
    }

    //Email
    if (!email || !formValidation.isValidEmail(email)) {
      showToast(toast, "Invalid email format", { type: TOAST_TYPES.WARNING });
      return false;
    }

    //Password 
    if (!formValidation.isValidPassword(password)) {
      showToast(toast, "Password must be at least 6 characters", { type: TOAST_TYPES.WARNING });
      return false;
    }

    //Password confirmation
    if (password !== confirmPassword) {
      showToast(toast, "Passwords don't match", { type: TOAST_TYPES.WARNING });
      return false;
    }

    return true;
  },
  validateSignInForm: (formData, toast) => {
    const { email, password } = formData;
  
    // Email validation
    if (!email || !formValidation.isValidEmail(email)) {
      showToast(toast, "Invalid email format", { type: TOAST_TYPES.WARNING });
      return false;
    }
  
    // Password validation - just check if it's provided
    if (!password) {
      showToast(toast, "Password is required", { type: TOAST_TYPES.WARNING });
      return false;
    }
  
    return true;
  }
};

export default formValidation;