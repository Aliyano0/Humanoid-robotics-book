/**
 * Centralized error handling utility for authentication flows
 */

export interface AuthError {
  code: string;
  message: string;
  userFriendlyMessage: string;
  severity: 'low' | 'medium' | 'high';
}

// Predefined error codes and user-friendly messages
const ERROR_MESSAGES: Record<string, AuthError> = {
  // Authentication errors
  EMAIL_NOT_FOUND: {
    code: 'EMAIL_NOT_FOUND',
    message: 'Email address not found',
    userFriendlyMessage: 'We couldn\'t find an account with that email address. Please check your email and try again.',
    severity: 'medium'
  },
  INVALID_CREDENTIALS: {
    code: 'INVALID_CREDENTIALS',
    message: 'Invalid credentials',
    userFriendlyMessage: 'The email or password you entered is incorrect. Please try again.',
    severity: 'medium'
  },
  ACCOUNT_LOCKED: {
    code: 'ACCOUNT_LOCKED',
    message: 'Account locked',
    userFriendlyMessage: 'Your account has been temporarily locked due to multiple failed login attempts. Please try again later.',
    severity: 'high'
  },
  EMAIL_ALREADY_EXISTS: {
    code: 'EMAIL_ALREADY_EXISTS',
    message: 'Email already exists',
    userFriendlyMessage: 'An account with this email address already exists. Please try logging in instead.',
    severity: 'medium'
  },
  PASSWORD_TOO_WEAK: {
    code: 'PASSWORD_TOO_WEAK',
    message: 'Password does not meet requirements',
    userFriendlyMessage: 'Your password must be at least 8 characters long and include a mix of letters, numbers, and symbols.',
    severity: 'medium'
  },
  INVALID_OTP: {
    code: 'INVALID_OTP',
    message: 'Invalid OTP',
    userFriendlyMessage: 'The code you entered is invalid or has expired. Please request a new code and try again.',
    severity: 'medium'
  },
  SESSION_EXPIRED: {
    code: 'SESSION_EXPIRED',
    message: 'Session expired',
    userFriendlyMessage: 'Your session has expired. Please log in again to continue.',
    severity: 'high'
  },
  NETWORK_ERROR: {
    code: 'NETWORK_ERROR',
    message: 'Network error',
    userFriendlyMessage: 'We\'re having trouble connecting to our servers. Please check your internet connection and try again.',
    severity: 'high'
  },
  SERVER_ERROR: {
    code: 'SERVER_ERROR',
    message: 'Server error',
    userFriendlyMessage: 'We\'re experiencing technical difficulties. Please try again in a few minutes.',
    severity: 'high'
  },
  UNKNOWN_ERROR: {
    code: 'UNKNOWN_ERROR',
    message: 'An unknown error occurred',
    userFriendlyMessage: 'Something went wrong. Please try again, and if the problem persists, contact support.',
    severity: 'high'
  }
};

/**
 * Transforms an error into a user-friendly format
 */
export const transformError = (error: any): AuthError => {
  // If it's already a predefined error
  if (typeof error === 'string' && ERROR_MESSAGES[error]) {
    return ERROR_MESSAGES[error];
  }

  // If it's an error object with a code
  if (error && typeof error === 'object' && error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }

  // If it's a network error
  if (error && typeof error === 'object' && error.message && error.message.includes('Network Error')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // If it's a server error (status code 5xx)
  if (error && typeof error === 'object' && error.response && error.response.status >= 500) {
    return ERROR_MESSAGES.SERVER_ERROR;
  }

  // If it's a client error (status code 4xx)
  if (error && typeof error === 'object' && error.response && error.response.status === 401) {
    return ERROR_MESSAGES.INVALID_CREDENTIALS;
  }

  if (error && typeof error === 'object' && error.response && error.response.status === 404) {
    return ERROR_MESSAGES.EMAIL_NOT_FOUND;
  }

  if (error && typeof error === 'object' && error.response && error.response.status === 409) {
    return ERROR_MESSAGES.EMAIL_ALREADY_EXISTS;
  }

  // If it's a validation error with known field
  if (error && typeof error === 'object' && error.field && error.message) {
    if (error.field === 'password') {
      return {
        code: 'VALIDATION_ERROR',
        message: error.message,
        userFriendlyMessage: 'Password validation failed: ' + error.message,
        severity: 'medium'
      };
    }
  }

  // Default to unknown error
  return ERROR_MESSAGES.UNKNOWN_ERROR;
};

/**
 * Displays an error message to the user in a user-friendly way
 */
export const displayError = (error: any): string => {
  const transformedError = transformError(error);
  return transformedError.userFriendlyMessage;
};

/**
 * Logs error details for debugging while protecting sensitive information
 */
export const logError = (error: any, context: string = ''): void => {
  const transformedError = transformError(error);

  console.group(`%c${context || 'Auth Error'}: ${transformedError.code}`, 'color: #ff0000; font-weight: bold;');
  console.log('User-friendly message:', transformedError.userFriendlyMessage);
  console.log('Original error:', error);
  console.groupEnd();
};