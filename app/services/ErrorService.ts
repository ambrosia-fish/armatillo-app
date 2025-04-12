import { Alert, Platform } from 'react-native';

export type ErrorLevel = 'info' | 'warning' | 'error' | 'critical' | 'silent';
export type ErrorSource = 'api' | 'auth' | 'ui' | 'storage' | 'network' | 'form' | 'unknown';

export interface ErrorOptions {
  level?: ErrorLevel;
  source?: ErrorSource;
  displayToUser?: boolean;
  context?: Record<string, any>;
  silent?: boolean; // Option to completely suppress logging
  navigationPath?: string; // Optional path to navigate to after error
}

interface ErrorObject {
  message: string;
  stack?: string;
  level: ErrorLevel;
  source: ErrorSource;
  timestamp: string;
  context: Record<string, any>;
  navigationPath?: string;
}

// Check if a message is approval-related (and should be suppressed)
const isApprovalRelatedMessage = (message: string): boolean => {
  const approvalPhrases = [
    'pre-alpha',
    'testing is only available',
    'Thank You for your interest',
    'pending approval',
    'contact josef@feztech.io',
    'No refresh token available',
    'Authentication failed', 
    'Invalid email or password'
  ];
  
  return approvalPhrases.some(phrase => message.includes(phrase));
};

// Check if the error context indicates this is approval-related
const isApprovalRelatedContext = (context: Record<string, any>): boolean => {
  return (
    context.approvalRelated === true || 
    (context.action && 
     (context.action === 'login.pendingApproval' || 
      context.action === 'ensureValidToken'))
  );
};

// Common error messages to standardize across the app
export const ErrorMessages = {
  FORM: {
    SUBMISSION_FAILED: 'There was a problem submitting the form. Please try again.',
    VALIDATION_FAILED: 'Please check the form for errors and try again.',
    UNKNOWN: 'An unknown error occurred while processing your request.',
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
    PERMISSION_DENIED: 'You do not have permission to perform this action.',
  },
  AUTH: {
    LOGIN_FAILED: 'Login failed. Please check your credentials and try again.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    NOT_AUTHENTICATED: 'You need to be logged in to access this feature.',
  },
  DATA: {
    LOAD_FAILED: 'Failed to load data. Please try again.',
    SAVE_FAILED: 'Failed to save data. Please try again.',
    NOT_FOUND: 'The requested information could not be found.',
  }
};

class ErrorService {
  private logErrors: boolean = true;
  
  /**
   * Main error handling method
   */
  handleError(error: Error | string, options: ErrorOptions = {}): ErrorObject {
    const {
      level = 'error',
      source = 'unknown',
      displayToUser = true,
      context = {},
      silent = false,
      navigationPath
    } = options;
    
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    // Check if this is an approval-related message or context that should be suppressed
    const shouldSuppressLog = 
      silent || 
      level === 'silent' ||
      isApprovalRelatedMessage(errorMessage) || 
      isApprovalRelatedContext(context);
    
    const errorObj: ErrorObject = {
      message: errorMessage,
      stack: typeof error !== 'string' ? error.stack : undefined,
      level: shouldSuppressLog ? 'silent' : level,
      source,
      timestamp: new Date().toISOString(),
      context,
      navigationPath
    };
    
    // Only log if not suppressed and logging is enabled
    if (this.logErrors && !shouldSuppressLog) {
      console.error(`[${source.toUpperCase()}][${level.toUpperCase()}]: ${errorObj.message}`, errorObj);
    }
    
    // Only show to user if not suppressed and displayToUser is true
    if (displayToUser && !shouldSuppressLog) {
      this.showErrorToUser(errorObj);
    }
    
    return errorObj;
  }
  
  /**
   * Handle form submission errors specifically
   */
  handleFormError(error: Error | string, options: {
    displayToUser?: boolean;
    context?: Record<string, any>;
    navigationPath?: string;
  } = {}): ErrorObject {
    return this.handleError(error, {
      level: 'error',
      source: 'form',
      ...options
    });
  }
  
  /**
   * Handle validation errors specifically
   */
  handleValidationError(
    fieldErrors: Record<string, string> = {}, 
    options: {
      displayToUser?: boolean;
      context?: Record<string, any>;
    } = {}
  ): ErrorObject {
    // Create a user-friendly error message
    const errorFields = Object.keys(fieldErrors);
    let message = ErrorMessages.FORM.VALIDATION_FAILED;
    
    if (errorFields.length > 0) {
      // Add specific field errors if available
      message += ' ' + errorFields.map(field => fieldErrors[field]).join('. ');
    }
    
    return this.handleError(message, {
      level: 'warning',
      source: 'form',
      context: { 
        validationErrors: fieldErrors,
        ...options.context 
      },
      ...options
    });
  }
  
  /**
   * Show a standardized form error to the user
   */
  showFormError(message: string, navigationPath?: string): void {
    const errorObj: ErrorObject = {
      message,
      level: 'error',
      source: 'form',
      timestamp: new Date().toISOString(),
      context: { action: 'form_submission' },
      navigationPath
    };
    
    this.showErrorToUser(errorObj);
  }
  
  /**
   * Show error to user with platform-specific implementation
   */
  private showErrorToUser(errorObj: ErrorObject): void {
    const { message, level, navigationPath } = errorObj;
    
    // Handle web platform differently
    if (Platform.OS === 'web') {
      switch (level) {
        case 'critical':
        case 'error':
          window.alert(`Error: ${message}`);
          break;
        case 'warning':
          window.alert(`Warning: ${message}`);
          break;
        case 'info':
          console.log(message);
          break;
        case 'silent':
          // Do nothing
          break;
      }
      
      // Handle navigation if provided
      if (navigationPath && typeof window !== 'undefined') {
        // Use dynamic import to avoid issues with SSR
        import('expo-router').then(({ router }) => {
          router.replace(navigationPath);
        }).catch(err => {
          console.error('Navigation error:', err);
        });
      }
    } else {
      // Native platform implementation
      switch (level) {
        case 'critical':
        case 'error':
          if (navigationPath) {
            Alert.alert('Error', message, [
              { 
                text: 'OK', 
                onPress: () => {
                  // Use dynamic import to avoid circular dependencies
                  import('expo-router').then(({ router }) => {
                    router.replace(navigationPath);
                  }).catch(err => {
                    console.error('Navigation error:', err);
                  });
                }
              }
            ]);
          } else {
            Alert.alert('Error', message);
          }
          break;
        case 'warning':
          Alert.alert('Warning', message);
          break;
        case 'info':
          console.log(message);
          break;
        case 'silent':
          // Do nothing
          break;
      }
    }
  }
}

export const errorService = new ErrorService();
export default {};
