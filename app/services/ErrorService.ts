import { Alert } from 'react-native';

export type ErrorLevel = 'info' | 'warning' | 'error' | 'critical' | 'silent';
export type ErrorSource = 'api' | 'auth' | 'ui' | 'storage' | 'network' | 'unknown';

export interface ErrorOptions {
  level?: ErrorLevel;
  source?: ErrorSource;
  displayToUser?: boolean;
  context?: Record<string, any>;
  silent?: boolean; // New option to completely suppress logging
}

interface ErrorObject {
  message: string;
  stack?: string;
  level: ErrorLevel;
  source: ErrorSource;
  timestamp: string;
  context: Record<string, any>;
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

class ErrorService {
  private logErrors: boolean = true;
  
  handleError(error: Error | string, options: ErrorOptions = {}): ErrorObject {
    const {
      level = 'error',
      source = 'unknown',
      displayToUser = true,
      context = {},
      silent = false
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
      context
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
  
  private showErrorToUser(errorObj: ErrorObject): void {
    const { message, level } = errorObj;
    
    switch (level) {
      case 'critical':
      case 'error':
        Alert.alert('Error', message);
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

export const errorService = new ErrorService();
export default {};